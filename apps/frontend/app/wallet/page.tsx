"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Gift,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletResponse {
  wallet: { currency: string };
  balance: number;
}

interface WalletTx {
  id: string;
  transactionType: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

export default function WalletPage() {
  const [amount, setAmount] = useState("50");
  const [currency, setCurrency] = useState<"USD" | "AED" | "EUR" | "GBP">(
    "USD",
  );
  const queryClient = useQueryClient();

  const wallet = useQuery<WalletResponse>({
    queryKey: ["wallet-me"],
    queryFn: () => apiFetch("/payments/wallet/me"),
  });
  const history = useQuery<WalletTx[]>({
    queryKey: ["wallet-history"],
    queryFn: () => apiFetch("/payments/wallet/transactions?limit=20&offset=0"),
  });

  const topUp = useMutation({
    mutationFn: () =>
      apiFetch("/payments/wallet/topup", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          paymentMethodId: "pm_card_visa",
        }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallet-me"] }),
        queryClient.invalidateQueries({ queryKey: ["wallet-history"] }),
      ]);
    },
  });

  const symbol = useMemo(
    () => ({ USD: "$", EUR: "€", GBP: "£", AED: "AED " })[currency],
    [currency],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pt-32 pb-12 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge
              variant="outline"
              className="border-redmix bg-white text-redmix px-3 py-1 mb-3"
            >
              My Finances
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">
              ezeeFlight Wallet
            </h1>
            <p className="text-foreground/90 mt-1">
              Manage your funds, rewards, and transaction history.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={currency} onValueChange={(v: any) => setCurrency(v)}>
              <SelectTrigger className="w-[140px] rounded-full border-muted-foreground/20 bg-muted/40 font-bold h-10">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_350px]">
          <div className="space-y-5">
            {/* Balance Card */}
            <section className="relative overflow-hidden text-foreground rounded-md bg-card p-5 shadow-2xl shadow-redmix/20">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground">
                    <Wallet className="h-5 w-5" />
                    <span className="text-sm font-medium uppercase tracking-wider">
                      Available Balance
                    </span>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-redmix" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-medium text-foreground">
                    {symbol}
                  </span>
                  <p className="text-6xl font-bold text-foreground tracking-tighter">
                    {(wallet.data?.balance ?? 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md px-4 py-3 flex-1 min-w-[140px]">
                    <p className="text-xs uppercase text-foreground font-bold tracking-widest">
                      Active Currency
                    </p>
                    <p className="text-lg font-bold mt-1 text-foreground">
                      {currency}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md px-4 py-3 flex-1 min-w-[140px]">
                    <p className="text-xs uppercase text-foreground font-bold tracking-widest">
                      Rewards Earned
                    </p>
                    <p className="text-lg font-bold mt-1 text-foreground">
                      {symbol}0.00
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" /> */}
              {/* <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-brand-yellow/20 blur-3xl" /> */}
            </section>

            {/* Transaction History */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-redmix" />
                  <h2 className="text-xl font-bold">Transaction History</h2>
                </div>
                <Button
                  variant="ghost"
                  className="text-xs font-bold text-redmix"
                >
                  View All <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="pb-4 font-bold">Details</th>
                      <th className="pb-4 font-bold text-center">Amount</th>
                      <th className="pb-4 font-bold text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {(history.data ?? []).length > 0 ? (
                      (history.data ?? []).map((tx) => (
                        <tr
                          key={tx.id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-full",
                                  tx.transactionType === "CREDIT"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-red-500/10 text-red-500",
                                )}
                              >
                                {tx.transactionType === "CREDIT" ? (
                                  <ArrowDownLeft className="h-5 w-5" />
                                ) : (
                                  <ArrowUpRight className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold">
                                  {tx.description ||
                                    (tx.transactionType === "CREDIT"
                                      ? "Wallet Top-up"
                                      : "Booking Payment")}
                                </p>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                                  {tx.transactionType}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td
                            className={cn(
                              "py-4 text-center font-bold text-lg tabular-nums",
                              tx.transactionType === "CREDIT"
                                ? "text-emerald-500"
                                : "",
                            )}
                          >
                            {tx.transactionType === "CREDIT" ? "+" : "-"}
                            {symbol}
                            {tx.amount.toFixed(2)}
                          </td>
                          <td className="py-4 text-right">
                            <p className="font-medium">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-12 text-center text-muted-foreground italic"
                        >
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {/* Top Up Form */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Quick Top-up</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Amount to Add ({currency})
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                      {symbol}
                    </span>
                    <Input
                      value={amount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        // Prevent multiple dots
                        if ((val.match(/\./g) || []).length <= 1) {
                          setAmount(val);
                        }
                      }}
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      className="h-12 pl-8 pr-4 bg-muted/20 border-border/50 rounded-xl focus:bg-background transition-all font-bold text-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["50", "100", "500"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className={cn(
                        "py-2 rounded-lg text-sm font-bold border transition-all",
                        amount === v
                          ? "bg-redmix/10 border-redmix text-redmix"
                          : "border-border/50 hover:border-redmix/30",
                      )}
                    >
                      {symbol}
                      {v}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => topUp.mutate()}
                  className="w-full h-12 bg-redmix hover:bg-brand-red-light rounded-xl font-bold text-md shadow-lg shadow-redmix/20 mt-2"
                  disabled={topUp.isPending}
                >
                  {topUp.isPending ? (
                    "Processing…"
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" /> Top-up Now
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-2 justify-center py-2 text-[10px] text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Secure payment via Stripe
                </div>
              </div>
            </section>

            <section className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-redmix" />
                <h2 className="text-xl font-bold">Ways to Earn</h2>
              </div>
              <ul className="space-y-4">
                {[
                  {
                    title: "Invite Friends",
                    desc: "Earn $10 for every referral link",
                    icon: ArrowUpRight,
                  },
                  {
                    title: "Trip Reviews",
                    desc: "Get credits for verified reviews",
                    icon: History,
                  },
                  {
                    title: "Cashback",
                    desc: "Up to 5% back on hotel bookings",
                    icon: Wallet,
                  },
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-redmix shrink-0 group-hover:scale-125 transition-transform" />
                    <div>
                      <p className="text-sm font-bold leading-none">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full mt-6 border-redmix/30 text-redmix hover:bg-redmix/10 rounded-xl font-bold text-xs"
              >
                Explore Reward Center
              </Button>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
