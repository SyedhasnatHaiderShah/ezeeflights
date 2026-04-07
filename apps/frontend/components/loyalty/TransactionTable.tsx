'use client';

interface Tx { id: string; type: string; points: number; createdAt: string; referenceId?: string | null }

export function TransactionTable({ txs }: { txs: Tx[] }) {
  return (
    <table className="w-full rounded border bg-white text-left text-sm">
      <thead><tr><th className="p-2">Type</th><th className="p-2">Points</th><th className="p-2">Reference</th><th className="p-2">Date</th></tr></thead>
      <tbody>
        {txs.map((tx) => (
          <tr key={tx.id} className="border-t"><td className="p-2">{tx.type}</td><td className="p-2">{tx.points}</td><td className="p-2">{tx.referenceId ?? '-'}</td><td className="p-2">{new Date(tx.createdAt).toLocaleDateString()}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
