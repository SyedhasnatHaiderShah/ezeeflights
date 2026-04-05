'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="p-8">
        <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
        <p className="my-3 text-slate-700">{error.message}</p>
        <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
