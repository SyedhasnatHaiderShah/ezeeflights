export function PolicyDocumentDownload({ url }: { url?: string | null }) {
  if (!url) {
    return <p className="text-sm text-gray-500">Policy document will be available after purchase.</p>;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-block rounded bg-emerald-600 px-4 py-2 text-white">
      Download policy document
    </a>
  );
}
