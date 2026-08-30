"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { BidDeal } from "@/lib/api/bid-deals";
import { Clock, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { cn } from "@/lib/utils";

interface BidDealCardProps {
  deal: BidDeal;
  departureDate: string;
}

export function FlightBidDealCard({ deal, departureDate }: BidDealCardProps) {
  const router = useRouter();
  const { data: session } = useAuthSession();
  const openAuthModal = useAuthModalStore((state: any) => state.open);

  const handleLockDeal = () => {
    if (!session) {
      openAuthModal("login");
      return;
    }

    // Navigate to checkout
    router.push(
      `/flights/bid/checkout?dealId=${deal.id}&dDate=${departureDate}` as any,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-redmix/20 bg-white dark:bg-card shadow-sm mb-4"
    >
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Left Side: Route & Title */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-redmix/10 text-redmix px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-redmix/20">
              Standby Bid Request
            </div>
            {/* <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              Limited Opportunity
            </span> */}
          </div>

          <h3 className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Fly from <span className="text-redmix">{deal.origin}</span> to{" "}
            <span className="text-redmix">{deal.destination}</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-md">
            Place a standby bid at the current lowest fare. We will attempt to
            secure your seat within 24 hours.
          </p>
        </div>

        {/* Middle: Features */}
        <div className="hidden lg:flex flex-[0.7] p-5 flex-col justify-center gap-3 bg-slate-50/50 dark:bg-slate-900/10">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground leading-tight">
                24-Hour Securing Window
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                We attempt to book your seat at this price.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground leading-tight">
                100% Refundable Deposit
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                Full refund if the ticket cannot be secured.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Price & Action */}
        <div className="p-4 md:p-5 flex flex-row md:flex-col items-center justify-between md:justify-center gap-3 bg-redmix/[0.02] min-w-[200px]">
          <div className="text-left md:text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter mb-0.5">
              Bid Amount
            </p>
            <div className="text-xl font-black text-foreground tracking-tight">
              <CurrencyDisplay
                amount={deal.bidPrice}
                currency={deal.currency}
              />
            </div>
          </div>

          <Button
            onClick={handleLockDeal}
            className="rounded-xl h-10 px-5 font-bold text-sm bg-redmix hover:bg-red-700 text-white shadow-lg shadow-redmix/20 gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Ticket className="w-4 h-4" />
            Place Standby Bid
          </Button>

          {/* <p className="hidden md:block text-[9px] text-muted-foreground font-medium uppercase tracking-tight">
            Rs {deal.depositAmount} refundable deposit
          </p> */}
        </div>
      </div>
    </motion.div>
  );
}
