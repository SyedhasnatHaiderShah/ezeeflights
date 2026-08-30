"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCheapBidStatus, updateCheapBidStatus, clearCheapBidCache } from "@/lib/api/admin-api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Loader2, Settings, RefreshCw, Sliders } from "lucide-react";
import { useLoadingStore } from "@/lib/store/use-loading-store";

export function AdminSystemSettings() {
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoadingStore();

  const statusQuery = useQuery({
    queryKey: ["cheap-bid-status"],
    queryFn: getCheapBidStatus,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateCheapBidStatus(status),
    onMutate: () => {
      startLoading("Updating Cheap Bid status...", true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cheap-bid-status"] });
    },
    onSettled: () => {
      stopLoading();
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: clearCheapBidCache,
    onMutate: () => {
      startLoading("Clearing flights search cache...", true);
    },
    onSuccess: (data) => {
      alert(data.message || "Search cache cleared successfully.");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to clear search cache.");
    },
    onSettled: () => {
      stopLoading();
    },
  });

  const currentStatus = statusQuery.data?.status ?? "Stop";

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> System Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system-wide toggles, backend caches, and operations settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cache Management Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">System Cache Management</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm text-foreground font-medium">Flights Search Cache</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clears all cached flight search results in memory. Use this if you want to force the system to fetch fresh live GDS pricing for new searches.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-dashed w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
              onClick={() => clearCacheMutation.mutate()}
              disabled={clearCacheMutation.isPending}
            >
              {clearCacheMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Clear Flights Search Cache"
              )}
            </Button>
          </div>
        </div>

        {/* Cheap Bids Toggle Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Global Feature Toggles</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-foreground font-medium">Cheap Bids Feature</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Instantly disable or enable applying Cheap Bid rules on matching customer search routes.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-md",
                    currentStatus === "Start" 
                      ? "bg-emerald-500/10 text-emerald-600" 
                      : "bg-amber-500/10 text-amber-600",
                  )}
                >
                  {currentStatus === "Start" ? "Running" : "Stopped"}
                </span>
                <Switch
                  id="cheap-bid-status-switch-settings"
                  checked={currentStatus === "Start"}
                  onCheckedChange={(checked) => {
                    statusMutation.mutate(checked ? "Start" : "Stop");
                  }}
                  disabled={statusQuery.isLoading || statusMutation.isPending}
                  className="scale-90"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
