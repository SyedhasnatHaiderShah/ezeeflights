"use client";

import React from "react";
import { Drawer } from "vaul";
import { AskEzeeChatContent } from "./AskEzeeChatContent";
import { useTranslation } from "react-i18next";

interface AskEzeeMobileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatProps: any;
}

export function AskEzeeMobile({
  open,
  onOpenChange,
  chatProps,
}: AskEzeeMobileProps) {
  const { t } = useTranslation();
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[110]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[120] flex flex-col h-[70vh] bg-background rounded-t-[2rem] outline-none">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 my-4" />
          <Drawer.Title className="sr-only">
            {t("Ask Ezee AI Assistant")}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {t("AI voice assistant for booking flights and travel inquiries.")}
          </Drawer.Description>
          <AskEzeeChatContent
            {...chatProps}
            onClose={() => onOpenChange(false)}
          />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
