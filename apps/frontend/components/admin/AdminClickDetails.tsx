"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listClickDetails,
  getClickDetailById,
  deleteClickDetail,
  ClickDetailRow,
} from "@/lib/api/admin-api";
import { AdminDataTable, ConfirmDialog } from "./AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Trash2,
  Search,
  X,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LIMIT = 20;

function prettyLog(log: string): string {
  try {
    return JSON.stringify(JSON.parse(log), null, 2);
  } catch {
    return log ?? "";
  }
}

export function AdminClickDetails() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [activeViewLog, setActiveViewLog] = useState<ClickDetailRow | null>(null);
  
  // Search state
  const [searchId, setSearchId] = useState("");
  const [activeSearchId, setActiveSearchId] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({
    isOpen: false,
    id: null,
  });

  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Regular paginated list query
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["click-details", page],
    queryFn: () => listClickDetails(page, LIMIT),
    placeholderData: (prev) => prev,
    enabled: !activeSearchId.trim() && mounted,
  });

  // Single ID search query
  const { data: searchResult, isLoading: isSearchLoading, isFetching: isSearchFetching, error: searchError } = useQuery({
    queryKey: ["click-details-search", activeSearchId],
    queryFn: () => getClickDetailById(activeSearchId),
    enabled: Boolean(activeSearchId.trim()) && mounted,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClickDetail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["click-details"] });
      // If we deleted the searched item, clear search
      if (confirmDelete.id === activeSearchId) {
        setActiveSearchId("");
        setSearchId("");
      }
      setConfirmDelete({ isOpen: false, id: null });
    },
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-redmix" />
      </div>
    );
  }

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = searchId.trim();
    setActiveSearchId(cleanId);
  };

  const handleClear = () => {
    setSearchId("");
    setActiveSearchId("");
  };

  const handleCopyLog = (id: string, logStr: string) => {
    const formatted = prettyLog(logStr);
    navigator.clipboard.writeText(formatted);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const showSearchLoader = isSearchLoading || isSearchFetching;

  return (
    <div className="space-y-6">
      {/* Search header bar */}
      <div className="rounded-3xl border border-border/60 bg-card/65 backdrop-blur-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-redmix" />
          Click Detail Inspector
        </h2>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-[11.5px] font-bold text-foreground mb-1 block">
              Search by Click ID (UUID)
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g. a6c4465d-9b79-4145-b48f-d02fb53ba761"
                className="pl-10 pr-10 rounded-2xl h-11 border-border/80 focus-visible:ring-redmix text-sm font-semibold"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              {searchId && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="submit"
              className="rounded-2xl h-11 px-8 bg-redmix text-white font-semibold shadow-md shadow-redmix/20 transition-all w-full sm:w-auto shrink-0"
              disabled={showSearchLoader || !searchId.trim()}
            >
              {showSearchLoader ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
            {activeSearchId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="rounded-2xl h-11 px-6 font-semibold"
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Search Result Inspector or Main Table */}
      {activeSearchId ? (
        <div>
          {showSearchLoader ? (
            <div className="flex items-center justify-center p-12 bg-card/60 rounded-3xl border border-border/60">
              <Loader2 className="h-8 w-8 animate-spin text-redmix" />
            </div>
          ) : searchError || !searchResult ? (
            <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-destructive">No Click Log Found</h3>
                <p className="text-sm text-destructive/80 mt-1">
                  Could not find any click log with the ID: <code className="font-mono bg-destructive/10 px-1.5 py-0.5 rounded">{activeSearchId}</code>.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/60 bg-card/65 backdrop-blur-xl p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Click Details Inspector</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-1 select-all">{searchResult.Id}</p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-xl px-4 py-2 text-xs font-semibold"
                  onClick={() => setConfirmDelete({ isOpen: true, id: searchResult.Id })}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete Log
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider block">Created On</span>
                  <span className="text-sm font-semibold text-foreground">
                    {searchResult.CreatedOn ? new Date(searchResult.CreatedOn).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider block">IP Address</span>
                  <span className="text-sm font-semibold text-foreground font-mono">
                    {searchResult.Ip ?? "—"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider block">Site Source</span>
                  <span className="text-sm font-semibold text-foreground font-mono">
                    {searchResult.sitesource ?? "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider">Log Payload (JSON)</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyLog(searchResult.Id, searchResult.log)}
                    className="h-8 rounded-lg text-xs"
                  >
                    {copied === searchResult.Id ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy JSON
                      </>
                    )}
                  </Button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono text-[12px] leading-relaxed overflow-x-auto border border-slate-800/80 dark:border-slate-800 max-h-[480px] shadow-inner whitespace-pre-wrap break-all">
                  {prettyLog(searchResult.log)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ) : (
        <AdminDataTable
          title="Click logs"
          subtitle="Page of click log details"
          totalCount={total}
          totalLabel="Click logs"
          isLoading={isLoading}
          headers={["Created On", "IP", "Site Source", "Log", "Action"]}
          hasRows={rows.length > 0}
          emptyMessage="No click logs found."
          pagination={{
            page,
            totalPages,
            onPageChange: setPage,
            isFetching,
          }}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="rounded-xl font-semibold gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", (isLoading || isFetching) && "animate-spin")} />
              Refresh
            </Button>
          }
        >
          {rows.map((row: ClickDetailRow) => {
            return (
              <tr
                key={row.Id}
                className="border-t border-border/60 align-middle hover:bg-muted/30 transition-colors"
              >
                <td className="px-3 py-3 whitespace-nowrap text-muted-foreground text-sm">
                  {row.CreatedOn
                    ? new Date(row.CreatedOn).toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 py-3 whitespace-nowrap font-mono text-sm">
                  {row.Ip ?? "—"}
                </td>
                <td className="px-3 py-3 whitespace-nowrap font-mono text-sm text-foreground font-semibold">
                  {row.sitesource ?? "—"}
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => setActiveViewLog(row)}
                    className="text-primary hover:underline text-sm font-semibold flex items-center gap-1.5"
                  >
                    View log
                  </button>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => {
                      setConfirmDelete({ isOpen: true, id: row.Id });
                    }}
                    className="text-destructive hover:text-destructive/80 disabled:opacity-40"
                    disabled={deleteMutation.isPending}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </AdminDataTable>
      )}

      {/* View Log Details Modal */}
      <Dialog open={!!activeViewLog} onOpenChange={(open) => { if (!open) setActiveViewLog(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col rounded-3xl p-6 border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-border/60">
            <DialogTitle className="text-lg font-bold text-foreground">Click Log Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono mt-1 select-all">
              ID: {activeViewLog?.Id}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Created On</span>
                <span className="text-xs font-semibold text-foreground">
                  {activeViewLog?.CreatedOn ? new Date(activeViewLog.CreatedOn).toLocaleString() : "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">IP Address</span>
                <span className="text-xs font-semibold text-foreground font-mono">
                  {activeViewLog?.Ip ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Site Source</span>
                <span className="text-xs font-semibold text-foreground font-mono">
                  {activeViewLog?.sitesource ?? "—"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Log Payload (JSON)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => activeViewLog && handleCopyLog(activeViewLog.Id, activeViewLog.log)}
                  className="h-8 rounded-lg text-xs"
                >
                  {copied === activeViewLog?.Id ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy JSON
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800/80 dark:border-slate-800 max-h-[360px] shadow-inner whitespace-pre-wrap break-all">
                {activeViewLog ? prettyLog(activeViewLog.log) : ""}
              </pre>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/60 flex justify-end">
            <Button
              type="button"
              onClick={() => setActiveViewLog(null)}
              className="rounded-xl h-10 px-6 font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, isOpen: open }))}
        onConfirm={() => {
          if (confirmDelete.id) deleteMutation.mutate(confirmDelete.id);
        }}
        message="Are you sure you want to delete this log entry?"
      />
    </div>
  );
}
