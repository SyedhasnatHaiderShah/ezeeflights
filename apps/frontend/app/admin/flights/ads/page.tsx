"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import {
  listFlightAds,
  updateFlightAd,
  AdminFlightAd,
} from "@/lib/api/admin-api";
import { Plane, Edit, Save, X, Search, ShieldAlert, Loader2 } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function FlightAdsAdminPage() {
  const router = useRouter();
  const { data: session, isLoading: isAuthLoading } = useAuthSession();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthLoading) {
      const hasRequiredRole =
        session?.roles?.some(
          (role: string) =>
            role.toLowerCase() === "admin" || role.toLowerCase() === "sub-admin"
        ) ?? false;
      if (!session) {
        router.replace("/auth/login");
      } else if (!hasRequiredRole) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [session, isAuthLoading, router]);

  const { data: ads, isLoading: isDataLoading } = useQuery({
    queryKey: ["admin-flight-ads"],
    queryFn: listFlightAds,
    enabled: isAuthorized === true,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      displayPrice: number;
      discountPct: number;
    }) =>
      updateFlightAd(payload.id, {
        displayPrice: payload.displayPrice,
        discountPct: payload.discountPct,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flight-ads"] });
      setEditingId(null);
    },
  });

  const handleEdit = (ad: AdminFlightAd) => {
    setEditingId(ad.id);
    setEditPrice(ad.displayPrice);
    setEditDiscount(ad.discountPct);
  };

  const handleSave = (id: string) => {
    updateMutation.mutate({
      id,
      displayPrice: editPrice,
      discountPct: editDiscount,
    });
  };

  const filteredAds =
    ads?.filter(
      (ad) =>
        ad.origin.toLowerCase().includes(search.toLowerCase()) ||
        ad.destination.toLowerCase().includes(search.toLowerCase()) ||
        ad.airline.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  if (isAuthLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8 pt-24">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-redmix" />
            <p className="text-muted-foreground font-medium tracking-tight">
              Verifying credentials...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-8 pt-24 text-center">
          <div className="mb-6 rounded-full bg-red-50 dark:bg-red-950/30 p-6 text-red-600">
            <ShieldAlert className="h-16 w-16" />
          </div>
          <h1 className="mb-2 text-3xl font-black text-foreground tracking-tight">Access Denied</h1>
          <p className="mb-8 max-w-md text-muted-foreground text-lg">
            You do not have the required permissions to access the Flight Ads panel. 
            Please contact the system administrator if you believe this is an error.
          </p>
          <Button 
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-3 rounded-2xl transition-all"
          >
            Return to Home
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/50">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
                  <Plane className="w-6 h-6 text-foreground" />
                  Flight Ads Management
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Manage pricing and discounts for metasearch partner flight ads.
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search origin, destination..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-redmix/50 w-full md:w-64 text-sm bg-background text-foreground"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold">Airline</TableHead>
                    <TableHead className="font-semibold">Original Price</TableHead>
                    <TableHead className="font-semibold">Discount %</TableHead>
                    <TableHead className="font-semibold">Display Price</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDataLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Loading flight ads...
                      </TableCell>
                    </TableRow>
                  ) : filteredAds.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No flight ads found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAds.map((ad) => (
                      <TableRow key={ad.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-bold text-foreground">
                            {ad.origin} → {ad.destination}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(ad.departureAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground">
                            {ad.airline}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {ad.flightNumber}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {ad.currency} {ad.originalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {editingId === ad.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editDiscount}
                              onChange={(e) =>
                                setEditDiscount(parseFloat(e.target.value))
                              }
                              className="w-20 px-2 py-1 border border-border rounded-md bg-background text-foreground"
                            />
                          ) : (
                            `${(ad.discountPct * 100).toFixed(1)}%`
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === ad.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">{ad.currency}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={editPrice}
                                onChange={(e) =>
                                  setEditPrice(parseFloat(e.target.value))
                                }
                                className="w-24 px-2 py-1 border border-border rounded-md bg-background text-foreground"
                              />
                            </div>
                          ) : (
                            <span className="font-bold text-redmix">
                              {ad.currency} {ad.displayPrice.toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === ad.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSave(ad.id)}
                                disabled={updateMutation.isPending}
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                                className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(ad)}
                              className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
