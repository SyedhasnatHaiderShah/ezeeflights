import { SupportMessage } from './types';

export function TicketThread({ messages }: { messages: SupportMessage[] }) {
  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div key={message.id} className={`max-w-[80%] rounded-lg p-3 text-sm ${message.isAgent ? 'ml-auto bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
          <p>{message.body}</p>
          <p className={`mt-1 text-xs ${message.isAgent ? 'text-slate-200' : 'text-slate-500'}`}>{new Date(message.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
