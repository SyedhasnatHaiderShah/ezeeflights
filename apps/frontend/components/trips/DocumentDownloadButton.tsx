'use client';

import { useState } from 'react';
import { downloadDocument } from '@/lib/api/trips';

export function DocumentDownloadButton({
  bookingId,
  docType,
  label,
}: {
  bookingId: string;
  docType: 'ticket' | 'voucher' | 'insurance';
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  const onDownload = async () => {
    setLoading(true);
    try {
      const blob = await downloadDocument(bookingId, docType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docType}-${bookingId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={onDownload} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" disabled={loading}>
      {loading ? 'Downloading...' : label}
    </button>
  );
}
