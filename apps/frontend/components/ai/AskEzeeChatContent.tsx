"use client";

import React, { useRef, useEffect } from "react";
import {
  Mic,
  Loader2,
  Plane,
  X,
  User,
  Bot,
  ArrowRight,
  User2,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Message } from "@/lib/hooks/use-ask-ezee";
import { useTranslation } from "react-i18next";

interface AskEzeeChatContentProps {
  messages: Message[];
  isListening: boolean;
  transcript: string;
  isProcessing: boolean;
  countdown: number | null;
  toggleListening: () => void;
  stopListening?: (opts?: { submit?: boolean }) => void;
  retryListening?: () => void;
  speechSupported?: boolean;
  examplePrompt?: string;
  listeningHint?: string;
  onClose: () => void;
  setCountdown: (val: number | null) => void;
  setIsListening: (val: boolean) => void;
  setTranscript: (val: string) => void;
  recognitionRef: React.MutableRefObject<any>;
  handleReuse: (text: string) => void;
  isGlass?: boolean;
}

export function AskEzeeChatContent({
  messages,
  isListening,
  transcript,
  isProcessing,
  countdown,
  toggleListening,
  stopListening,
  retryListening,
  speechSupported = true,
  examplePrompt = "Delhi to Dubai on May 31",
  listeningHint,
  onClose,
  setCountdown,
  setIsListening,
  setTranscript,
  recognitionRef,
  handleReuse,
  isGlass = false,
}: AskEzeeChatContentProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript, isListening]);

  const lastIncomplete = [...messages]
    .reverse()
    .find((m) => m.role === "ai" && m.incomplete);

  const hasErrorOrIncomplete = messages.some(
    (m) =>
      m.incomplete ||
      m.text.includes("isn't complete") ||
      m.text.includes("missing") ||
      m.text.includes("failed") ||
      m.text.includes("not supported") ||
      m.text.includes("not available") ||
      m.text.includes("Could not find")
  );

  const visibleMessages = hasErrorOrIncomplete
    ? messages.filter((_, idx) => idx !== 0)
    : messages;

  return (
    <>
      {/* <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Ask Ezee
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-redmix/80">
                AI Voice Search
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div> */}

      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar",
          isGlass ? "bg-transparent" : "bg-background"
        )}
      >
        <AnimatePresence mode="popLayout">
          {visibleMessages.map((msg, idx) => (
            <motion.div
              key={`${msg.role}-${idx}-${msg.text.slice(0, 24)}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                  msg.role === "user"
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "bg-redmix text-white",
                )}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className="max-w-[85%]">
                <div className="flex items-center gap-2">
                  {msg.role === "user" && (
                    <button
                      onClick={() => handleReuse(msg.text)}
                      className="p-1 rounded-full text-slate-400 hover:text-redmix dark:text-slate-500 dark:hover:text-redmix hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                      title="Reuse this prompt"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <div
                    className={cn(
                      "px-3 py-2 rounded-2xl text-xs leading-[1.5] shadow-sm transition-all whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-slate-900 dark:bg-slate-800 text-white rounded-tr-none"
                        : msg.incomplete
                          ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 rounded-tl-none"
                          : isGlass
                            ? "bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-tl-none"
                            : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-none",
                    )}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* {msg.incomplete && (
                  <div className="mt-2 p-3 rounded-xl bg-redmix/5 border border-redmix/15 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-redmix">
                      Example (say all of this)
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      &ldquo;{msg.examplePrompt ?? examplePrompt}&rdquo;
                    </p>
                    {retryListening && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={retryListening}
                        className="h-8 w-full rounded-full bg-redmix text-white text-xs font-semibold"
                      >
                        <Mic className="h-3.5 w-3.5 mr-1.5" />
                        Try again
                      </Button>
                    )}
                  </div>
                )} */}

                {msg.data && msg.data.from && msg.data.to && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 p-3 bg-redmix/5 dark:bg-redmix/10 border border-redmix/10 dark:border-redmix/20 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between opacity-60">
                      <span className="text-[9px] font-black uppercase text-redmix tracking-tighter">
                        {t("Booking Summary")}
                      </span>
                      <Plane className="h-3 w-3 rotate-45 text-redmix" />
                    </div>
                    <div className="flex items-center gap-2 font-bold text-sm text-foreground/80 tracking-tight">
                      <span>{msg.data.from}</span>
                      <ArrowRight className="h-3 w-3 text-redmix/40" />
                      <span>{msg.data.to}</span>
                    </div>
                    <div className="flex gap-4 text-xs font-medium text-foreground/70 tracking-tight">
                      <span>📅 {msg.data.departureDate || "N/A"}</span>
                      <span>👤 {msg.data.adults || 1} {t("Pax")}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {isListening && (
            <motion.div
              key="listening-msg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex gap-3 flex-row-reverse"
            >
              <div className="h-8 w-8 rounded-full bg-redmix flex items-center justify-center flex-shrink-0 shadow-sm border border-redmix/20">
                <User2 className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1 max-w-[85%]">
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tr-none bg-white dark:bg-muted shadow-sm text-xs text-foreground/80">
                  {transcript || t("Listening… speak your full trip")}
                </div>
                <p className="text-[10px] text-muted-foreground px-1">
                  {t("Include origin and destination. Pause ~2s when done.")}
                </p>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing-msg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-redmix text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                <span className="h-1.5 w-1.5 bg-redmix/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 bg-redmix/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 bg-redmix/40 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={cn(
        "p-5 flex flex-col items-center border-t",
        isGlass
          ? "bg-transparent border-white/10"
          : "bg-background border-slate-50 dark:border-slate-800"
      )}>
        {isListening && (
          <div className="relative mb-4 flex flex-col items-center gap-3 w-full">
            <div className="absolute inset-[-15px] bg-redmix/10 rounded-full blur-2xl animate-pulse" />
            <p className="text-xs font-medium text-center text-muted-foreground relative z-10 px-2">
              {t("Keep speaking — we listen up to 10 seconds. Tap Done when finished.")}
            </p>
            <div className="flex items-center gap-3 relative z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (stopListening) {
                    stopListening();
                  } else {
                    recognitionRef.current?.stop();
                    setIsListening(false);
                  }
                  setTranscript("");
                }}
                className="h-10 w-10 rounded-full bg-background text-foreground"
                title={t("Cancel")}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={() =>
                  stopListening
                    ? stopListening({ submit: true })
                    : toggleListening()
                }
                className="h-10 px-5 rounded-full bg-redmix text-white text-xs font-semibold shadow-md"
              >
                {t("Done")}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {countdown !== null ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-bold text-foreground/80 tracking-tight animate-pulse uppercase">
              {t("Searching in {{countdown}}s...", { countdown })}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCountdown(null)}
              className="h-8 px-4 text-xs font-bold tracking-wider"
            >
              {t("Cancel")}
            </Button>
          </div>
        ) : (
          !isListening &&
          !isProcessing && (
            <div className="flex flex-col items-center gap-4 w-full">
              {lastIncomplete && retryListening ? (
                <Button
                  onClick={retryListening}
                  className="h-11 w-full max-w-[240px] rounded-full bg-redmix text-white text-xs font-semibold tracking-wider shadow-[0_10px_30px_rgba(235,53,53,0.3)]"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {t("Speak again")}
                </Button>
              ) : (
                <Button
                  onClick={toggleListening}
                  disabled={!speechSupported}
                  className="h-11 w-full max-w-[240px] rounded-full bg-redmix text-white text-xs font-semibold tracking-wider shadow-[0_10px_30px_rgba(235,53,53,0.3)] hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {t("Start Speaking")}
                </Button>
              )}
              <p className="text-xs font-medium text-foreground/80 tracking-tight text-center leading-relaxed">
                {speechSupported ? (
                  <>Ask me: &ldquo;{examplePrompt}&rdquo;</>
                ) : (
                  t("Voice search requires Chrome, Edge, or Safari.")
                )}
              </p>
            </div>
          )
        )}

        {isProcessing && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-redmix" />
            <p className="text-xs font-bold text-foreground tracking-wider">
              {t("Processing...")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
