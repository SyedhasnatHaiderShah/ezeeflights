'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import { generateCorrelationId, CORRELATION_COOKIE } from './correlation-id';

interface CorrelationContextValue {
  /** Stable per browser tab/session — read from middleware-set cookie. */
  sessionId: string;
  /** Call before each user action (search, booking, payment) to get a fresh traceable ID. */
  generateActionId: () => string;
  /** The most recently generated action ID — display this in error UI. */
  currentActionId: string | null;
}

const CorrelationContext = createContext<CorrelationContextValue | null>(null);

function readCookieSessionId(): string {
  if (typeof document === 'undefined') return generateCorrelationId();
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CORRELATION_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : generateCorrelationId();
}

interface CorrelationProviderProps {
  children: React.ReactNode;
  /** Pass from server via cookies() so SSR and CSR agree on the same session ID. */
  sessionId: string;
}

export function CorrelationProvider({ children, sessionId: initialSessionId }: CorrelationProviderProps) {
  // useRef so the session ID is stable for the lifetime of the component tree
  const sessionId = useRef(initialSessionId || readCookieSessionId()).current;
  const [currentActionId, setCurrentActionId] = useState<string | null>(null);

  function generateActionId(): string {
    const id = generateCorrelationId();
    setCurrentActionId(id);
    return id;
  }

  return (
    <CorrelationContext.Provider value={{ sessionId, generateActionId, currentActionId }}>
      {children}
    </CorrelationContext.Provider>
  );
}

export function useCorrelationId(): CorrelationContextValue {
  const ctx = useContext(CorrelationContext);
  if (!ctx) {
    throw new Error('useCorrelationId must be called inside <CorrelationProvider>');
  }
  return ctx;
}
