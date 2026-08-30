"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchAirports } from "@/lib/utils/airport-search";
import { isNative } from "@/lib/capacitor";
import {
  requestMicrophoneAccess,
  getMicrophonePermissionMessage,
} from "@/lib/capacitor/microphone-permission";
import { nextApiOrigin } from "@/lib/bff/config";
import {
  ASK_EZEE_LISTENING_HINT,
  ASK_EZEE_MAX_LISTEN_MS,
  ASK_EZEE_MIN_TRANSCRIPT_CHARS,
  ASK_EZEE_SILENCE_MS,
  buildIncompletePromptMessage,
  detectMissingFlightParts,
  getExampleFlightPrompt,
} from "@/lib/ask-ezee-prompt";
import {
  buildSessionTranscript,
  mergeCommittedTranscript,
} from "@/lib/utils/speech-transcript";
import { useTranslation } from "react-i18next";

const getBaseUrl = () => (isNative() ? nextApiOrigin() : "");

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

type SpeechRecognitionErrorCode =
  | "aborted"
  | "audio-capture"
  | "bad-grammar"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed";

function getSpeechErrorCode(event: Event): SpeechRecognitionErrorCode | "unknown" {
  const code = (event as SpeechRecognitionErrorEvent).error;
  return (code as SpeechRecognitionErrorCode) || "unknown";
}

function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

export interface Message {
  role: "user" | "ai";
  text: string;
  data?: any;
  /** Show as “please complete your prompt” with example */
  incomplete?: boolean;
  examplePrompt?: string;
  provider?: string;
}

function isValidIata(code: string | null | undefined): boolean {
  return !!code && /^[A-Z]{3}$/.test(code);
}

function isValidFutureDate(dateStr: string | undefined): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(d.getTime()) && d >= today;
}

async function logFailedResponse(context: string, response: Response) {
  let body = "";
  try {
    body = await response.text();
  } catch {
    body = "(could not read body)";
  }
  console.error(`[AskEzee] ${context} failed`, {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    body,
  });
}

export function useAskEzeeAi(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  autoStart?: boolean,
) {
  const { t } = useTranslation();
  const examplePrompt = getExampleFlightPrompt();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: t("Hello! I'm Ezee, your AI travel assistant. Say where you fly from and where to — e.g. \"Delhi to Dubai\" (date is optional, defaults to 1 week from today)."),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef(false);
  const autoStartSessionRef = useRef(false);
  /** Finalized text kept across browser mic restarts within one listen session */
  const committedTranscriptRef = useRef("");
  const transcriptRef = useRef("");
  const shouldKeepListeningRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxListenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);
  const intentionalStopRef = useRef(false);
  const isProcessingRef = useRef(false);
  const router = useRouter();

  const clearListenTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxListenTimerRef.current) {
      clearTimeout(maxListenTimerRef.current);
      maxListenTimerRef.current = null;
    }
  }, []);

  const appendAiMessage = useCallback(
    (text: string, opts?: { incomplete?: boolean }) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text,
          incomplete: opts?.incomplete,
          examplePrompt: opts?.incomplete ? examplePrompt : undefined,
        },
      ]);
    },
    [examplePrompt],
  );

  const appendAiMessageRef = useRef(appendAiMessage);
  appendAiMessageRef.current = appendAiMessage;
  const tRef = useRef(t);
  tRef.current = t;
  const submitTranscriptRef = useRef<(text: string) => void>(() => {});
  const scheduleSilenceSubmitRef = useRef<() => void>(() => {});
  const rebuildTranscriptRef = useRef<(event: any) => string>(() => "");

  const resolveIATA = useCallback(async (query: string) => {
    if (!query?.trim()) return null;
    const upperQuery = query.trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(upperQuery)) return upperQuery;
    try {
      const results = await searchAirports(query);
      if (results.length > 0 && results[0].iata_code) {
        return results[0].iata_code.toUpperCase();
      }
    } catch (err) {
      console.error("[AskEzee] Airport lookup failed:", { query, err });
    }
    return null;
  }, []);

  const showIncompleteAndAllowRetry = useCallback(
    (text: string, missing: string[], apiQuestion?: string) => {
      submittedRef.current = false;
      appendAiMessage(
        buildIncompletePromptMessage({ missing, apiQuestion }, t),
        { incomplete: true },
      );
      setTranscript("");
      transcriptRef.current = "";
      committedTranscriptRef.current = "";
      console.warn("[AskEzee] Incomplete voice prompt:", { text, missing });
    },
    [appendAiMessage],
  );

  const handleProcess = useCallback(
    async (text: string) => {
      if (isProcessingRef.current) return;

      const trimmed = text.trim();
      const localMissing = detectMissingFlightParts(trimmed);
      if (
        trimmed.length < ASK_EZEE_MIN_TRANSCRIPT_CHARS ||
        localMissing.length > 0
      ) {
        showIncompleteAndAllowRetry(trimmed, localMissing);
        return;
      }

      isProcessingRef.current = true;
      setIsProcessing(true);

      try {
        const response = await fetch(
          `${getBaseUrl()}/api/ai/extract-booking`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: text }),
          },
        );

        if (!response.ok) {
          await logFailedResponse("extract-booking", response);
          throw new Error(
            `extract-booking failed (${response.status} ${response.statusText})`,
          );
        }

        const resBody = await response.json();
        console.log(`[AskEzee] AI extraction successful. Provider: ${resBody._provider || "Gemini"}`, resBody);

        if (resBody.status === "incomplete") {
          showIncompleteAndAllowRetry(
            trimmed,
            detectMissingFlightParts(trimmed),
            resBody.question,
          );
          return;
        }

        const rawData = resBody.data || resBody;
        let searchUrl = "";

        if (rawData.searchType === "hotel") {
          const resolvedDest = await resolveIATA(
            rawData.destination || rawData.to,
          );
          if (!isValidIata(resolvedDest)) {
            throw new Error(
              `Could not find airport for "${rawData.destination || rawData.to}". Please say a city name or 3-letter code.`,
            );
          }

          // Default checkInDate to 1 week from current date if missing or invalid
          let checkInDate = rawData.checkInDate;
          if (!isValidFutureDate(checkInDate)) {
            const defaultCheckIn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            checkInDate = defaultCheckIn.toISOString().split("T")[0];
          }

          let checkOutDate = rawData.checkOutDate;
          if (!isValidFutureDate(checkOutDate)) {
            const defaultCheckOut = new Date(new Date(checkInDate).getTime() + 24 * 60 * 60 * 1000);
            checkOutDate = defaultCheckOut.toISOString().split("T")[0];
          }

          const data = {
            ...rawData,
            destination: resolvedDest,
            checkInDate,
            checkOutDate,
          };

          const destName = data.destination || "your destination";
          const date = data.checkInDate;

          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              text: `Great! I'm searching for hotels in ${destName} starting on ${date}...`,
              data,
            },
          ]);

          const params = new URLSearchParams();
          params.set("destination", data.destination);
          if (data.checkInDate) params.set("checkInDate", data.checkInDate);
          if (data.checkOutDate) params.set("checkOutDate", data.checkOutDate);
          params.set("guests", (data.guests || 1).toString());
          params.set("rooms", (data.rooms || 1).toString());
          params.set("loading", "false");

          searchUrl = `/hotels/result?${params.toString()}`;
        } else {
          const resolvedFrom = await resolveIATA(rawData.from);
          const resolvedTo = await resolveIATA(rawData.to);

          if (!isValidIata(resolvedFrom)) {
            showIncompleteAndAllowRetry(trimmed, [
              `origin (“${rawData.from}” — try a city name like Lahore or Delhi)`,
            ]);
            return;
          }
          if (!isValidIata(resolvedTo)) {
            showIncompleteAndAllowRetry(trimmed, [
              `destination (“${rawData.to}” — try a city name like Dubai)`,
            ]);
            return;
          }

          // Default departureDate to 1 week (7 days) from current date if missing or invalid
          let departureDate = rawData.departureDate;
          if (!isValidFutureDate(departureDate)) {
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            departureDate = nextWeek.toISOString().split("T")[0];
          }

          const data = {
            ...rawData,
            from: resolvedFrom,
            to: resolvedTo,
            departureDate,
          };

          const fromName = data.from || "your origin";
          const toName = data.to || "your destination";
          const date = data.departureDate;

          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              text: `Great! I've found a flight from ${fromName} to ${toName} on ${date}. I'm searching for the best prices now...`,
              data,
            },
          ]);

          const params = new URLSearchParams();
          params.set("org", data.from);
          params.set("des", data.to);
          if (data.departureDate) params.set("dDate", data.departureDate);
          if (data.returnDate) params.set("rDate", data.returnDate);
          params.set("adt", (data.adults || 1).toString());
          params.set("chd", (data.children || 0).toString());
          params.set("inf", (data.infants || 0).toString());
          params.set("class", data.cabinClass || "Economy");
          params.set(
            "trip",
            data.tripType === "roundtrip" ? "round-trip" : "one-way",
          );
          params.set("loading", "false");

          searchUrl = `/flights/result?${params.toString()}`;
        }

        setCountdown(3);
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);

        setTimeout(() => {
          router.push(searchUrl as any);
          setTimeout(() => onOpenChange(false), 300);
        }, 3000);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error("[AskEzee] Voice search failed:", {
          error,
          message,
          transcript: text,
        });
        const isValidation =
          message.includes("Could not find") ||
          message.includes("date is missing") ||
          message.includes("isn't complete");

        appendAiMessage(
          isValidation
            ? message
            : buildIncompletePromptMessage({ apiQuestion: message }, t),
          { incomplete: !isValidation ? true : undefined },
        );
        submittedRef.current = false;
      } finally {
        isProcessingRef.current = false;
        setIsProcessing(false);
        setTranscript("");
        transcriptRef.current = "";
        committedTranscriptRef.current = "";
      }
    },
    [
      appendAiMessage,
      onOpenChange,
      resolveIATA,
      router,
      showIncompleteAndAllowRetry,
    ],
  );

  const submitTranscript = useCallback(
    (text: string, opts?: { skipLocalCheck?: boolean }) => {
      const userMsg = text.trim();
      if (!userMsg || submittedRef.current) return;

      if (!opts?.skipLocalCheck) {
        const missing = detectMissingFlightParts(userMsg);
        if (missing.length > 0) {
          appendAiMessage(
            buildIncompletePromptMessage({ missing }, t),
            { incomplete: true },
          );
          submittedRef.current = false;
          return;
        }
      }

      submittedRef.current = true;
      setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
      handleProcess(userMsg);
    },
    [appendAiMessage, handleProcess],
  );
  submitTranscriptRef.current = submitTranscript;

  const finishListeningAndSubmit = useCallback(() => {
    shouldKeepListeningRef.current = false;
    clearListenTimers();
    intentionalStopRef.current = true;
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    recognitionActiveRef.current = false;
    setIsListening(false);

    const full = transcriptRef.current.trim();

    if (full.length < ASK_EZEE_MIN_TRANSCRIPT_CHARS) {
      submittedRef.current = false;
      appendAiMessage(
        buildIncompletePromptMessage({
          missing: detectMissingFlightParts(full),
        }, t),
        { incomplete: true },
      );
      return;
    }

    submitTranscript(full);
  }, [appendAiMessage, clearListenTimers, submitTranscript]);

  const scheduleSilenceSubmit = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (shouldKeepListeningRef.current && !submittedRef.current) {
        finishListeningAndSubmit();
      }
    }, ASK_EZEE_SILENCE_MS);
  }, [finishListeningAndSubmit]);
  scheduleSilenceSubmitRef.current = scheduleSilenceSubmit;

  const rebuildTranscriptFromEvent = useCallback((event: any) => {
    const sessionText = buildSessionTranscript(event);
    const full = mergeCommittedTranscript(
      committedTranscriptRef.current,
      sessionText,
    );

    transcriptRef.current = full;
    setTranscript(full);
    return full;
  }, []);
  rebuildTranscriptRef.current = rebuildTranscriptFromEvent;

  const startListening = useCallback(async () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      appendAiMessage(
        t(
          "Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.",
        ),
      );
      return;
    }

    if (recognitionActiveRef.current) {
      return;
    }

    const micGranted = await requestMicrophoneAccess();
    if (!micGranted) {
      return;
    }

    submittedRef.current = false;
    intentionalStopRef.current = false;
    shouldKeepListeningRef.current = true;
    committedTranscriptRef.current = "";
    setTranscript("");
    transcriptRef.current = "";
    clearListenTimers();

    maxListenTimerRef.current = setTimeout(() => {
      if (shouldKeepListeningRef.current) {
        finishListeningAndSubmit();
      }
    }, ASK_EZEE_MAX_LISTEN_MS);

    try {
      recognition.start();
      recognitionActiveRef.current = true;
      setIsListening(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already started")) {
        recognitionActiveRef.current = true;
        setIsListening(true);
        return;
      }
      console.error("[AskEzee] Could not start speech recognition:", message);
      appendAiMessage(
        t(
          "Voice input is not available on this device or browser. Try Chrome on Android or Safari on iOS.",
        ),
      );
    }
  }, [appendAiMessage, clearListenTimers, finishListeningAndSubmit, t]);

  const stopListening = useCallback(
    (opts?: { submit?: boolean }) => {
      if (!recognitionActiveRef.current && !isListening) {
        return;
      }
      if (opts?.submit) {
        finishListeningAndSubmit();
        return;
      }
      shouldKeepListeningRef.current = false;
      clearListenTimers();
      intentionalStopRef.current = true;
      recognitionRef.current?.stop();
      recognitionActiveRef.current = false;
      setIsListening(false);
    },
    [clearListenTimers, finishListeningAndSubmit, isListening],
  );

  const retryListening = useCallback(() => {
    submittedRef.current = false;
    void startListening();
  }, [startListening]);

  const toggleListening = useCallback(() => {
    if (recognitionActiveRef.current || isListening) {
      stopListening({ submit: true });
    } else {
      void startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang =
          typeof navigator !== "undefined" && navigator.language
            ? navigator.language
            : "en-US";

        recognitionRef.current.onresult = (event: any) => {
          rebuildTranscriptRef.current(event);
          scheduleSilenceSubmitRef.current();
        };

        recognitionRef.current.onstart = () => {
          recognitionActiveRef.current = true;
          setIsListening(true);
        };

        recognitionRef.current.onerror = (event: Event) => {
          const code = getSpeechErrorCode(event);
          const detail = (event as SpeechRecognitionErrorEvent).message;

          // Expected when the user stops listening or the drawer closes.
          if (code === "aborted" || intentionalStopRef.current) {
            intentionalStopRef.current = false;
            recognitionActiveRef.current = false;
            setIsListening(false);
            return;
          }

          recognitionActiveRef.current = false;

          if (code === "no-speech") {
            console.info("[AskEzee] Speech recognition: no-speech (no audio detected)");
          } else {
            console.error(
              `[AskEzee] Speech recognition error: ${code}${detail ? ` — ${detail}` : ""}`,
            );
          }

          if (code === "no-speech") {
            shouldKeepListeningRef.current = false;
            appendAiMessageRef.current(
              buildIncompletePromptMessage({
                missing: ["your voice input"],
                apiQuestion: "I didn't hear anything.",
              }, t),
              { incomplete: true },
            );
          } else if (code === "not-allowed" || code === "service-not-allowed") {
            appendAiMessageRef.current(
              tRef.current(getMicrophonePermissionMessage("denied")),
            );
          } else if (code === "network") {
            appendAiMessageRef.current(
              t(
                "Voice recognition needs an internet connection (Chrome uses Google's speech service). Check your connection and try again.",
              ),
            );
          } else if (code === "audio-capture") {
            appendAiMessageRef.current(
              t("No microphone was found. Please connect a mic and try again."),
            );
          } else {
            appendAiMessageRef.current(
              t("Voice input failed ({{code}}). Please try again.", { code }),
            );
          }
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          recognitionActiveRef.current = false;

          if (
            shouldKeepListeningRef.current &&
            !intentionalStopRef.current &&
            !submittedRef.current
          ) {
            const heard = transcriptRef.current.trim();
            if (heard) {
              committedTranscriptRef.current = heard;
            }
            try {
              recognitionRef.current?.start();
              recognitionActiveRef.current = true;
              setIsListening(true);
            } catch {
              setIsListening(false);
              scheduleSilenceSubmitRef.current();
            }
            return;
          }

          intentionalStopRef.current = false;
          setIsListening(false);
        };
      }
    }

    return () => {
      shouldKeepListeningRef.current = false;
      intentionalStopRef.current = true;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (maxListenTimerRef.current) clearTimeout(maxListenTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore stop errors during cleanup
      }
      recognitionRef.current = null;
      recognitionActiveRef.current = false;
    };
    // Mount once — handlers read latest callbacks via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) {
      autoStartSessionRef.current = false;
      if (recognitionActiveRef.current) {
        intentionalStopRef.current = true;
        try {
          recognitionRef.current?.stop();
        } catch {
          // ignore
        }
        recognitionActiveRef.current = false;
        setIsListening(false);
      }
      return;
    }

    setMessages([
      {
        role: "ai",
        text: t("Hello! I'm Ezee, your AI travel assistant. Say where you fly from and where to — e.g. \"Delhi to Dubai\" (date is optional, defaults to 1 week from today)."),
      },
    ]);
    setTranscript("");
    transcriptRef.current = "";
    submittedRef.current = false;
    setCountdown(null);
    setIsProcessing(false);
    isProcessingRef.current = false;

    if (!autoStart || autoStartSessionRef.current) {
      return;
    }
    autoStartSessionRef.current = true;

    const timer = setTimeout(() => {
      void startListening();
    }, 500);

    return () => clearTimeout(timer);
  }, [autoStart, open, startListening]);

  const speechSupported = isSpeechRecognitionSupported();

  const handleReuse = (text: string) => {
    if (isProcessingRef.current) return;
    submittedRef.current = false;
    setMessages((prev) => [...prev, { role: "user", text }]);
    handleProcess(text);
  };

  return {
    messages,
    isListening,
    transcript,
    isProcessing,
    countdown,
    toggleListening,
    startListening,
    stopListening,
    speechSupported,
    setCountdown,
    setIsListening,
    setTranscript,
    recognitionRef,
    handleReuse,
    retryListening,
    examplePrompt,
    listeningHint: ASK_EZEE_LISTENING_HINT,
  };
}
