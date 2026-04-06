'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
      <p className="my-3 text-slate-700 max-w-md">{error.message}</p>
      <button 
        className="rounded-full bg-primary px-6 py-2 text-primary-foreground font-semibold hover:opacity-90 transition-opacity" 
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
