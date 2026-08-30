"use client";

import React, { useState, useEffect } from "react";
import { useAskEzeeAi } from "@/lib/hooks/use-ask-ezee";
import { AskEzeeMobile } from "./AskEzeeMobile";
import { AskEzeeDesktop } from "./AskEzeeDesktop";

interface AskEzeeAiProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoStart?: boolean;
}

export function AskEzeeAi({ open, onOpenChange, autoStart }: AskEzeeAiProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const chatLogic = useAskEzeeAi(open, onOpenChange, autoStart);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Avoid hydration mismatch by waiting for mount
  if (isMobile === null) return null;

  return isMobile ? (
    <AskEzeeMobile
      open={open}
      onOpenChange={onOpenChange}
      chatProps={chatLogic}
    />
  ) : (
    <AskEzeeDesktop
      open={open}
      onOpenChange={onOpenChange}
      chatProps={chatLogic}
    />
  );
}
