'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/lib/hooks/use-profile';
import {
  analyzeTravelCompliance,
  downloadTravelDocument,
  listBookingTravelDocuments,
  listMyTravelDocuments,
  scanPassportDocument,
  shareTravelDocument,
  uploadTravelDocument,
  type TravelComplianceResult,
  type TravelDocumentRecord,
  type TravelDocumentType,
} from '@/lib/api/travel-documents';

const docTypes: TravelDocumentType[] = ['PASSPORT', 'NATIONAL_ID', 'VISA', 'E_TICKET', 'HOTEL_VOUCHER', 'INSURANCE', 'OTHER'];

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TravelDocumentsPanel({
  title = 'Travel Documents',
  bookingId,
  showCompliance = false,
  profileAware = false,
  onProfileUpdated,
}: {
  title?: string;
  bookingId?: string;
  showCompliance?: boolean;
  profileAware?: boolean;
  onProfileUpdated?: () => Promise<void> | void;
}) {
  const queryClient = useQueryClient();
  const profileQuery = useProfile(profileAware || showCompliance);
  const [docType, setDocType] = useState<TravelDocumentType>('PASSPORT');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [passportScanFile, setPassportScanFile] = useState<File | null>(null);
  const [travelerId, setTravelerId] = useState('');
  const [shareMethod, setShareMethod] = useState<'EMAIL' | 'WHATSAPP' | 'PDF'>('PDF');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePhone, setSharePhone] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null);
  const [complianceResult, setComplianceResult] = useState<TravelComplianceResult | null>(null);
  const [returnDate, setReturnDate] = useState('');
  const [destinations, setDestinations] = useState('');

  const documentsQuery = useQuery({
    queryKey: bookingId ? ['travel-documents', bookingId] : ['travel-documents', 'me'],
    queryFn: () => (bookingId ? listBookingTravelDocuments(bookingId) : listMyTravelDocuments()),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!documentFile) throw new Error('Please choose a document to upload.');
      const form = new FormData();
      form.append('file', documentFile);
      form.append('docType', docType);
      if (bookingId) form.append('bookingId', bookingId);
      if (travelerId) form.append('travelerId', travelerId);
      const result = await uploadTravelDocument(form);
      return result;
    },
    onSuccess: async (result) => {
      setUploadMessage(`Uploaded ${result.document.title ?? result.document.originalFileName}`);
      setDocumentFile(null);
      await queryClient.invalidateQueries({ queryKey: bookingId ? ['travel-documents', bookingId] : ['travel-documents', 'me'] });
      if (onProfileUpdated) await onProfileUpdated();
    },
    onError: (error) => {
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed');
    },
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      if (!passportScanFile) throw new Error('Please choose a passport scan file.');
      return scanPassportDocument(passportScanFile);
    },
    onSuccess: async (result) => {
      setScanResult(result);
      setUploadMessage('Passport scan complete and profile updated when fields were readable.');
      setPassportScanFile(null);
      await queryClient.invalidateQueries({ queryKey: ['profile-me'] });
      if (onProfileUpdated) await onProfileUpdated();
    },
    onError: (error) => {
      setUploadMessage(error instanceof Error ? error.message : 'Passport scan failed');
    },
  });

  const complianceMutation = useMutation({
    mutationFn: async () =>
      analyzeTravelCompliance({
        passportExpiry: profileQuery.data?.passportExpiry ?? profileQuery.data?.profile?.passportExpiry ?? undefined,
        returnDate,
        nationality: profileQuery.data?.nationality ?? profileQuery.data?.profile?.nationality ?? undefined,
        destinations: destinations.split(',').map((item) => item.trim()).filter(Boolean),
      }),
    onSuccess: (result) => setComplianceResult(result),
  });

  const shareMutation = useMutation({
    mutationFn: async (document: TravelDocumentRecord) =>
      shareTravelDocument(document.id, {
        method: shareMethod,
        email: shareMethod === 'EMAIL' ? shareEmail.trim() || undefined : undefined,
        phone: shareMethod === 'WHATSAPP' ? sharePhone.trim() || undefined : undefined,
      }),
    onSuccess: async (result) => {
      setUploadMessage(result.sent ? `${result.method} share sent.` : `Copy this link: ${result.shareUrl}`);
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (doc: TravelDocumentRecord) => {
      const blob = await downloadTravelDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = doc.originalFileName;
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });

  const documents = documentsQuery.data ?? [];
  const profile = profileQuery.data;
  const travelers = profile?.travelers ?? [];
  const profileWarnings = useMemo(() => {
    const expiry = profile?.passportExpiry ?? profile?.profile?.passportExpiry;
    if (!expiry) return ['Passport expiry missing from profile.'];
    return [
      `Passport on file expires on ${expiry}.`,
      'Use Passport Scan to refresh and auto-fill fields.',
    ];
  }, [profile?.passportExpiry, profile?.profile?.passportExpiry]);

  return (
    <div className="space-y-6 rounded-2xl border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-slate-500">Secure passport, visa, e-ticket, and hotel voucher storage.</p>
        </div>
        <div className="rounded-xl border bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {bookingId ? `Booking ${bookingId}` : 'Profile vault'}
        </div>
      </div>

      {uploadMessage ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{uploadMessage}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border p-4">
          <h3 className="font-semibold">Upload document</h3>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block space-y-1">
              <span className="font-medium text-slate-600">Document type</span>
              <select value={docType} onChange={(e) => setDocType(e.target.value as TravelDocumentType)} className="w-full rounded-lg border px-3 py-2">
                {docTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-slate-600">File</span>
              <input type="file" onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)} className="w-full rounded-lg border px-3 py-2" />
            </label>
            {travelers.length > 0 ? (
              <label className="block space-y-1">
                <span className="font-medium text-slate-600">Traveler profile</span>
                <select value={travelerId} onChange={(e) => setTravelerId(e.target.value)} className="w-full rounded-lg border px-3 py-2">
                  <option value="">Primary profile</option>
                  {travelers.map((traveler) => (
                    <option key={traveler.id} value={traveler.id}>{traveler.fullName} • {traveler.passportNumber}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <button onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending} className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white disabled:opacity-50">
              {uploadMutation.isPending ? 'Uploading…' : 'Upload document'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border p-4">
          <h3 className="font-semibold">Passport scan OCR</h3>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block space-y-1">
              <span className="font-medium text-slate-600">Passport image/PDF</span>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setPassportScanFile(e.target.files?.[0] ?? null)} className="w-full rounded-lg border px-3 py-2" />
            </label>
            <button onClick={() => scanMutation.mutate()} disabled={scanMutation.isPending} className="rounded-lg border px-4 py-2 font-semibold disabled:opacity-50">
              {scanMutation.isPending ? 'Scanning…' : 'Scan passport'}
            </button>
            {scanResult ? <pre className="overflow-auto rounded-xl bg-slate-50 p-3 text-xs">{JSON.stringify(scanResult, null, 2)}</pre> : null}
          </div>
        </section>
      </div>

      {showCompliance ? (
        <section className="rounded-2xl border p-4">
          <h3 className="font-semibold">AI travel compliance</h3>
          <p className="mt-1 text-sm text-slate-500">Checks passport expiry and advisory visa rules for multi-city itineraries.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Return date</span>
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-medium text-slate-600">Destinations</span>
              <input value={destinations} onChange={(e) => setDestinations(e.target.value)} placeholder="Dubai, Paris, Rome" className="w-full rounded-lg border px-3 py-2" />
            </label>
          </div>
          <button onClick={() => complianceMutation.mutate()} disabled={complianceMutation.isPending || !returnDate || !destinations.trim()} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50">
            {complianceMutation.isPending ? 'Checking…' : 'Run compliance check'}
          </button>
          {complianceResult ? (
            <div className="mt-4 space-y-3 rounded-2xl border bg-slate-50 p-4 text-sm">
              <p className="font-semibold">{complianceResult.summary}</p>
              <div className="space-y-2">
                {complianceResult.warnings.map((warning, index) => (
                  <div key={`${warning.title}-${index}`} className="rounded-xl border bg-white p-3">
                    <p className="font-medium">{warning.title}</p>
                    <p className="text-slate-600">{warning.message}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {complianceResult.destinationAdvice.map((advice) => (
                  <div key={advice.destination} className="rounded-xl border bg-white p-3">
                    <p className="font-medium">{advice.destination}</p>
                    <p className="text-slate-600">{advice.visaRequirement}</p>
                    <p className="text-xs text-slate-500">{advice.note}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {profileAware || showCompliance ? (
        <section className="rounded-2xl border p-4">
          <h3 className="font-semibold">Passport health</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {profileWarnings.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border p-4">
        <h3 className="font-semibold">Stored documents</h3>
        <div className="mt-3 space-y-3">
          {documentsQuery.isLoading ? <p className="text-sm text-slate-500">Loading documents…</p> : null}
          {documents.map((document) => (
            <div key={document.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{document.title ?? document.docType}</p>
                  <p className="text-sm text-slate-500">{document.travelerName ?? 'Primary profile'} • {document.originalFileName}</p>
                  <p className="text-xs text-slate-500">{document.docType} • {formatBytes(document.sizeBytes)}{document.expiryDate ? ` • Expires ${document.expiryDate}` : ''}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button onClick={() => downloadMutation.mutate(document)} className="rounded-lg border px-3 py-2">Download</button>
                  <button onClick={() => shareMutation.mutate(document)} className="rounded-lg border px-3 py-2">Share</button>
                </div>
              </div>
            </div>
          ))}
          {documents.length === 0 ? <p className="text-sm text-slate-500">No travel documents uploaded yet.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border p-4 text-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <span className="font-medium text-slate-600">Share method</span>
            <select value={shareMethod} onChange={(e) => setShareMethod(e.target.value as 'EMAIL' | 'WHATSAPP' | 'PDF')} className="w-full rounded-lg border px-3 py-2">
              <option value="PDF">PDF link</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-medium text-slate-600">Email</span>
            <input value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="recipient@example.com" className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-slate-600">Phone</span>
            <input value={sharePhone} onChange={(e) => setSharePhone(e.target.value)} placeholder="+9715xxxxxxx" className="w-full rounded-lg border px-3 py-2" />
          </label>
        </div>
      </section>
    </div>
  );
}
