"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/lib/hooks/use-profile";
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
} from "@/lib/api/travel-documents";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileUp,
  Scan,
  ShieldCheck,
  Download,
  Share2,
  AlertCircle,
  Save,
  Loader2,
} from "lucide-react";
import { useToast, toast } from "@/lib/hooks/use-toast";
import { useTranslation } from "react-i18next";

const docTypes: TravelDocumentType[] = [
  "PASSPORT",
  "NATIONAL_ID",
  "VISA",
  "E_TICKET",
  "HOTEL_VOUCHER",
  "INSURANCE",
  "OTHER",
];

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TravelDocumentsPanel({
  title = "Travel Documents",
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const profileQuery = useProfile(profileAware || showCompliance);
  const [docType, setDocType] = useState<TravelDocumentType>("PASSPORT");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [passportScanFile, setPassportScanFile] = useState<File | null>(null);
  const [travelerId, setTravelerId] = useState("primary");
  const [shareMethod, setShareMethod] = useState<"EMAIL" | "WHATSAPP" | "PDF">(
    "PDF",
  );
  const [shareEmail, setShareEmail] = useState("");
  const [sharePhone, setSharePhone] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(
    null,
  );
  const [complianceResult, setComplianceResult] =
    useState<TravelComplianceResult | null>(null);
  const [returnDate, setReturnDate] = useState("");
  const [destinations, setDestinations] = useState("");

  const documentsQuery = useQuery({
    queryKey: bookingId
      ? ["travel-documents", bookingId]
      : ["travel-documents", "me"],
    queryFn: () =>
      bookingId
        ? listBookingTravelDocuments(bookingId)
        : listMyTravelDocuments(),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!documentFile) throw new Error(t("Please choose a document to upload."));
      const form = new FormData();
      form.append("file", documentFile);
      form.append("docType", docType);
      if (bookingId) form.append("bookingId", bookingId);
      if (travelerId && travelerId !== "primary")
        form.append("travelerId", travelerId);
      const result = await uploadTravelDocument(form);
      return result;
    },
    onSuccess: async (result) => {
      setUploadMessage(
        `Uploaded ${result.document.title ?? result.document.originalFileName}`,
      );
      setDocumentFile(null);
      await queryClient.invalidateQueries({
        queryKey: bookingId
          ? ["travel-documents", bookingId]
          : ["travel-documents", "me"],
      });
      if (onProfileUpdated) await onProfileUpdated();
    },
    onError: (error) => {
      setUploadMessage(
        error instanceof Error ? error.message : t("Upload failed"),
      );
    },
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      if (!passportScanFile)
        throw new Error(t("Please choose a passport scan file."));
      return scanPassportDocument(passportScanFile);
    },
    onSuccess: async (result) => {
      setScanResult(result);
      setUploadMessage(t("Passport scan complete and profile updated."));
      setPassportScanFile(null);
      await queryClient.invalidateQueries({ queryKey: ["profile-me"] });
      if (onProfileUpdated) await onProfileUpdated();
    },
    onError: (error) => {
      setUploadMessage(
        error instanceof Error ? error.message : t("Passport scan failed"),
      );
    },
  });

  const complianceMutation = useMutation({
    mutationFn: async () =>
      analyzeTravelCompliance({
        passportExpiry:
          profileQuery.data?.passportExpiry ??
          profileQuery.data?.profile?.passportExpiry ??
          undefined,
        returnDate,
        nationality:
          profileQuery.data?.nationality ??
          profileQuery.data?.profile?.nationality ??
          undefined,
        destinations: destinations
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    onSuccess: (result) => setComplianceResult(result),
  });

  const shareMutation = useMutation({
    mutationFn: async (document: TravelDocumentRecord) =>
      shareTravelDocument(document.id, {
        method: shareMethod,
        email:
          shareMethod === "EMAIL" ? shareEmail.trim() || undefined : undefined,
        phone:
          shareMethod === "WHATSAPP"
            ? sharePhone.trim() || undefined
            : undefined,
      }),
    onSuccess: async (result) => {
      setUploadMessage(
        result.sent
          ? `${result.method} share sent.`
          : `Copy this link: ${result.shareUrl}`,
      );
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (doc: TravelDocumentRecord) => {
      const blob = await downloadTravelDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
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
    if (!expiry) return [t("Passport expiry missing from profile.")];
    return [
      t("Passport on file expires on {{date}}.", { date: expiry }),
      t("Use Passport Scan to refresh and auto-fill fields."),
    ];
  }, [profile?.passportExpiry, profile?.profile?.passportExpiry, t]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <Badge variant="default" className="font-mono">
            {bookingId ? t("Booking: {{id}}", { id: bookingId }) : t("Secure Vault")}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {t("Manage your passports, visas, and travel documents in one secure place.")}
        </p>
      </div>

      {uploadMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          {uploadMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card className="overflow-hidden border-brand-red/10 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-redmix/10 text-brand-red">
                <FileUp className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">{t("Upload Document")}</CardTitle>
                <CardDescription>
                  {t("Add new documents to your vault")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="doc-type">{t("Document Type")}</Label>
              <Select
                value={docType}
                onValueChange={(v) => setDocType(v as TravelDocumentType)}
              >
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder={t("Select type")} />
                </SelectTrigger>
                <SelectContent>
                  {docTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">{t("File")}</Label>
              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
                  className="cursor-pointer pr-10"
                />
                {documentFile && (
                  <Badge
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    variant="outline"
                  >
                    {t("Selected")}
                  </Badge>
                )}
              </div>
            </div>

            {travelers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="traveler">{t("Traveler Profile")}</Label>
                <Select value={travelerId} onValueChange={setTravelerId}>
                  <SelectTrigger id="traveler">
                    <SelectValue placeholder={t("Select traveler")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">{t("Primary Profile")}</SelectItem>
                    {travelers.map((traveler) => (
                      <SelectItem key={traveler.id} value={traveler.id}>
                        {traveler.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/10 border-t pt-4">
            <Button
              className="w-full bg-redmix hover:bg-brand-red-light"
              onClick={() => uploadMutation.mutate()}
              disabled={uploadMutation.isPending || !documentFile}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Uploading...")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("Save Document")}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Scan Section */}
        <Card className="overflow-hidden border-brand-red/10 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-redmix/10 text-brand-red">
                <Scan className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">{t("Passport OCR Scan")}</CardTitle>
                <CardDescription>
                  {t("Auto-fill profile from passport image")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="passport-scan">{t("Passport Image / PDF")}</Label>
              <Input
                id="passport-scan"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) =>
                  setPassportScanFile(e.target.files?.[0] ?? null)
                }
                className="cursor-pointer"
              />
            </div>
            {scanResult && (
              <div className="rounded-lg bg-muted p-3 text-[10px] font-mono overflow-auto max-h-32">
                <pre>{JSON.stringify(scanResult, null, 2)}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/10 border-t pt-4">
            <Button
              variant="outline"
              className="w-full border-brand-red/20 text-brand-red hover:bg-brand-red/5 hover:text-brand-red"
              onClick={() => scanMutation.mutate()}
              disabled={scanMutation.isPending || !passportScanFile}
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Scanning...")}
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  {t("Start Scan")}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {showCompliance && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">{t("AI Travel Compliance")}</CardTitle>
            </div>
            <CardDescription>
              {t("Verify visa requirements and passport validity")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("Return Date")}</Label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("Destinations")}</Label>
                <Input
                  value={destinations}
                  onChange={(e) => setDestinations(e.target.value)}
                  placeholder={t("e.g. Dubai, Paris, Rome")}
                />
              </div>
            </div>
            <Button
              onClick={() => complianceMutation.mutate()}
              disabled={
                complianceMutation.isPending ||
                !returnDate ||
                !destinations.trim()
              }
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {complianceMutation.isPending
                ? t("Checking...")
                : t("Run Compliance Check")}
            </Button>

            {complianceResult && (
              <div className="mt-4 space-y-4 rounded-xl border bg-background/50 p-4">
                <p className="font-semibold text-foreground">
                  {complianceResult.summary}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {complianceResult.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-background p-3 text-sm"
                    >
                      <div className="flex items-center gap-2 font-medium text-amber-600 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        {warning.title}
                      </div>
                      <p className="text-muted-foreground">{warning.message}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {complianceResult.destinationAdvice.map((advice, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-background p-3 text-sm"
                    >
                      <p className="font-semibold mb-1">{advice.destination}</p>
                      <p className="text-foreground">
                        {advice.visaRequirement}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {advice.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("Stored Documents")}</CardTitle>
          <CardDescription>
            {t("All your uploaded travel identification and tickets")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documentsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <FileUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  {t("No documents found")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("Upload your first document to see it here.")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {documents.map((document) => (
                  <Card
                    key={document.id}
                    className="relative group overflow-hidden border-border/50 hover:border-brand-red/20 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="outline"
                          className="bg-redmix/5 text-brand-red border-brand-red/10"
                        >
                          {document.docType.replace(/_/g, " ")}
                        </Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => downloadMutation.mutate(document)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => shareMutation.mutate(document)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-semibold truncate">
                        {document.title ?? document.originalFileName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {document.travelerName ?? t("Primary Traveler")}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        <span>{formatBytes(document.sizeBytes)}</span>
                        {document.expiryDate && (
                          <span
                            className={
                              new Date(document.expiryDate) < new Date()
                                ? "text-brand-red"
                                : ""
                            }
                          >
                            {t("Expires")}: {document.expiryDate}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Share settings Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("Global Share Settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("Share Method")}</Label>
              <Select
                value={shareMethod}
                onValueChange={(v) => setShareMethod(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">{t("Secure PDF Link")}</SelectItem>
                  <SelectItem value="EMAIL">{t("Email Delivery")}</SelectItem>
                  <SelectItem value="WHATSAPP">{t("WhatsApp Message")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Default Email")}</Label>
              <Input
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Default Phone")}</Label>
              <Input
                value={sharePhone}
                onChange={(e) => setSharePhone(e.target.value)}
                placeholder="+9715xxxxxxx"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 border-t py-3">
          <p className="text-[10px] text-muted-foreground italic">
            {t("* These settings will be applied when you click 'Share' on any document above.")}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
