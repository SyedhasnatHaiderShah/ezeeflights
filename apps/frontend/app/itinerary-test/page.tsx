"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search, Info, AlertTriangle, CheckCircle } from "lucide-react";

export default function ItineraryTestPage() {
  const [customerId, setCustomerId] = useState("29159");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<{
    id: number;
    customerId: number;
    outBoundFlights: string;
    inBoundFlights: string | null;
  } | null>(null);

  const { toast } = useToast();

  const handleFetch = async () => {
    if (!customerId.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a customer ID first.",
      });
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = (await apiFetch(
        `/notifications/flight-details/${customerId}`,
      )) as any;
      
      setData(res);
      toast({
        title: "Success",
        description: `Successfully loaded itinerary for customer ${customerId}`,
      });
    } catch (err: any) {
      const msg = err.message || "Failed to fetch itinerary details.";
      setError(msg);
      
      // Trigger a soft toast for user feedback
      toast({
        title: "Not Found",
        description: `Flight details not found for customerId: ${customerId}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-blue-600/30">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Itinerary HTML Tester
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Live testing console to verify and inspect `tbl_flightdetailshtml` record rendering.
            </p>
          </div>
          
          <div className="flex gap-2 items-center bg-slate-900 border border-slate-800 rounded-lg p-1.5 shadow-inner w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Customer ID..."
                className="bg-transparent border-0 pl-9 pr-4 text-slate-100 focus-visible:ring-0 focus-visible:ring-offset-0 w-full md:w-48 placeholder:text-slate-600"
              />
            </div>
            <Button
              onClick={handleFetch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md transition-all active:scale-95"
            >
              {loading ? "Fetching..." : "Fetch Itinerary"}
            </Button>
          </div>
        </div>

        {/* Error notification card */}
        {error && (
          <div className="bg-red-950/20 border border-red-500/30 text-red-300 p-4 rounded-xl flex items-start gap-3 shadow-lg backdrop-blur-sm">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Error response from backend</p>
              <p className="text-xs text-red-400/90 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Dynamic Display of Results */}
        {data ? (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Outbound Itinerary */}
            {data.outBoundFlights && (
              <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-2xl rounded-2xl">
                <div className="bg-slate-900 px-6 py-4 border-b border-slate-800/80 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Outbound Flights</h2>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded border border-slate-800/60">ID: {data.customerId}</span>
                </div>
                <CardContent className="p-6 bg-[#f1f1f1] text-black">
                  <div 
                    dangerouslySetInnerHTML={{ __html: data.outBoundFlights }} 
                    className="overflow-x-auto"
                  />
                </CardContent>
              </Card>
            )}

            {/* Inbound Itinerary */}
            {data.inBoundFlights ? (
              <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-2xl rounded-2xl">
                <div className="bg-slate-900 px-6 py-4 border-b border-slate-800/80 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inbound Flights</h2>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded border border-slate-800/60">ID: {data.customerId}</span>
                </div>
                <CardContent className="p-6 bg-[#f1f1f1] text-black">
                  <div 
                    dangerouslySetInnerHTML={{ __html: data.inBoundFlights }} 
                    className="overflow-x-auto"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="bg-slate-900/30 border border-slate-900 p-6 text-center rounded-2xl text-slate-500 text-sm flex items-center justify-center gap-2">
                <Info className="h-4 w-4 text-slate-600" />
                No return (inbound) flights exist for this booking record.
              </div>
            )}

            {/* Raw JSON Inspect */}
            <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl">
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800/80">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">JSON payload inspection</h3>
              </div>
              <CardContent className="p-6">
                <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto text-green-400 max-h-[300px]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/10">
              <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
                <Info className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-slate-400 font-medium">No active inspection loaded</p>
              <p className="text-slate-600 text-xs mt-1 max-w-sm text-center">
                Enter a customer ID and query the table to test the rendering structure.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
