import { ReactNode } from 'react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  children: ReactNode;
}

export function ChatBubble({ role, children }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${isUser ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900 border'}`}>
        {!isUser && <div className="mb-1 text-xs font-semibold text-indigo-600">ezee AI</div>}
        {children}
      </div>
    </div>
  );
}
