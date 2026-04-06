"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { oauthExchangeRequest } from "@/lib/api/auth-api";
import { queryClient } from "@/lib/query/query-client";

function OAuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    const error = params.get("error");
    const code = params.get("code");

    if (error === "oauth_failed") {
      setMessage("Google sign-in was cancelled or could not be completed.");
      return;
    }

    if (!code) {
      setMessage(
        "Missing sign-in code. Open the link from the login page again.",
      );
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await oauthExchangeRequest({ code });
        if (cancelled) {
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
        if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
          router.replace("/2fa" as any);
          return;
        }
        router.replace("/dashboard" as any);
      } catch {
        if (!cancelled) {
          setMessage(
            "This sign-in link expired or was already used. Try Google again from login.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-slate-700">{message}</p>
      <Link
        className="text-sm text-blue-600 hover:underline"
        href={"/auth/login" as any}
      >
        Back to login
      </Link>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <section className="mx-auto max-w-md rounded-xl bg-white p-8 shadow">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">
        Finishing sign-in
      </h1>
      <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
        <OAuthCallbackContent />
      </Suspense>
    </section>
  );
}
