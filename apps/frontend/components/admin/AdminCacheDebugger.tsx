"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";
import {
  Search,
  Database,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Plane,
  Server,
  FileCode,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

function JsonViewer({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);
  if (!data)
    return (
      <p className="text-xs text-muted-foreground italic">No data available.</p>
    );

  let formatted = "";
  try {
    formatted =
      typeof data === "string"
        ? JSON.stringify(JSON.parse(data), null, 2)
        : JSON.stringify(data, null, 2);
  } catch {
    formatted = String(data);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 px-2.5 py-1 rounded-xl bg-card border border-border/80 text-foreground hover:bg-muted font-semibold transition-all z-10 text-xs flex items-center gap-1.5 shadow-sm"
        title="Copy JSON"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <pre className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono text-[11.5px] leading-relaxed overflow-x-auto border border-slate-800/80 dark:border-slate-800 max-h-[350px] shadow-inner">
        {formatted}
      </pre>
    </div>
  );
}

export function AdminCacheDebugger() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any> | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a search query.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("query", query.trim());

      const res = await apiFetch<any>(
        `/flights/debug-cache?${queryParams.toString()}`,
      );
      if (res && res.results) {
        setResults(res.results);
      } else {
        setResults({});
      }
    } catch (err: any) {
      console.error("[CacheDebugger] Failed to query cache:", err);
      toast({
        title: "Query failed",
        description: err.message || "Failed to search the backend cache.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasResults = results && Object.keys(results).length > 0;

  return (
    <div className="space-y-6">
      {/* Search Header Panel */}
      <div className="rounded-3xl border border-border/60 bg-card/65 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <Database className="h-5 w-5 text-redmix" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Cache Debugger Utility
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inspect active Redis and Memory cache details. Enter any
              identifier below to scan matches.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-foreground block">
              Cache Key, ID, or Page URL (itinerary/booking)
            </label>
            <Input
              type="text"
              placeholder="Paste custom key, ID, or copy & paste the entire itinerary/booking URL..."
              className="rounded-2xl h-11 border-border/80 text-sm font-semibold"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="rounded-2xl h-11 px-8 bg-redmix text-white font-semibold shadow-md shadow-redmix/20 transition-all w-full sm:w-auto shrink-0"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Query Backend Cache
            </Button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          <Loader2 className="inline h-8 w-8 animate-spin text-redmix mb-3" />
          <p className="text-sm font-medium">
            Scanning Redis database & memory buffers...
          </p>
        </div>
      ) : results && !hasResults ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
          <Server className="inline h-10 w-10 opacity-30 mb-3" />
          <p className="text-sm font-medium text-foreground">
            No Cached Data Matches Found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            No matching entries could be resolved from current cache storage for
            your query.
          </p>
        </div>
      ) : results && hasResults ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-redmix" />
              Resolved Cache Items ({Object.keys(results).length})
            </h3>
          </div>

          <div className="space-y-6">
            {Object.entries(results).map(([keyName, item]) => (
              <div
                key={keyName}
                className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold bg-muted text-foreground border border-border">
                      {keyName}
                    </span>
                    {!item.found && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                        Expired / Not Found
                      </span>
                    )}
                  </div>
                </div>

                {item.found && (
                  <div className="space-y-2">
                    <JsonViewer data={item.data} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
