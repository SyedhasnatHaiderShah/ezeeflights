"use client";

import React, { useState } from "react";
import { Plus, CreditCard, Trash2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  n: string; // Last 4 digits
  e: string; // Expiry
  brand: string;
}

export function PaymentMethods() {
  const [cards, setCards] = useState<PaymentMethod[]>([
    { id: "1", n: "4242", e: "12/28", brand: "Visa" },
    { id: "2", n: "1881", e: "04/27", brand: "Mastercard" },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [showCvc, setShowCvc] = useState(false);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.match(/.{1,4}/g)?.join(" ").substring(0, 19) || digits;
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 2) {
      return `${digits.slice(0, 2)} / ${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = newCard.number.replace(/\s/g, "");
    const last4 = cleanNumber.slice(-4) || "0000";
    const brand = cleanNumber.startsWith("4") ? "Visa" : "Mastercard";
    
    const card: PaymentMethod = {
      id: Math.random().toString(36).substr(2, 9),
      n: last4,
      e: newCard.expiry,
      brand: brand,
    };

    setCards([...cards, card]);
    setIsAddOpen(false);
    setNewCard({ number: "", expiry: "", cvc: "", name: "" });
  };

  const removeCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">Manage your saved cards and billing options</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-redmix hover:bg-brand-red-light gap-2 rounded-xl h-11 px-6 shadow-lg shadow-redmix/10">
              <Plus className="h-4 w-4" />
              Add New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-redmix/10">
                  <CreditCard className="h-5 w-5 text-redmix" />
                </div>
                Payment Details
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCard} className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="card-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cardholder Name</Label>
                <Input 
                  id="card-name" 
                  placeholder="e.g. John Doe" 
                  className="h-12 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                  value={newCard.name}
                  onChange={e => setNewCard({...newCard, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Card Number</Label>
                <div className="relative">
                  <Input 
                    id="card-number" 
                    placeholder="0000 0000 0000 0000" 
                    className="h-12 bg-muted/30 border-muted-foreground/20 focus:bg-background pl-4 pr-12 transition-all font-mono"
                    value={newCard.number}
                    onChange={e => setNewCard({...newCard, number: formatCardNumber(e.target.value)})}
                    required 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CreditCard className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiry Date</Label>
                  <Input 
                    id="expiry" 
                    placeholder="MM / YY" 
                    className="h-12 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                    value={newCard.expiry}
                    onChange={e => setNewCard({...newCard, expiry: formatExpiry(e.target.value)})}
                    maxLength={7}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CVC / CVV</Label>
                  <div className="relative">
                    <Input 
                      id="cvc" 
                      placeholder="•••" 
                      type={showCvc ? "text" : "password"} 
                      maxLength={4}
                      className="h-12 bg-muted/30 border-muted-foreground/20 focus:bg-background pr-12 transition-all"
                      value={newCard.cvc}
                      onChange={e => setNewCard({...newCard, cvc: e.target.value.replace(/\D/g, "")})}
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvc(!showCvc)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-redmix transition-colors"
                    >
                      {showCvc ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/5 p-4 text-[11px] leading-relaxed text-emerald-700 border border-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <p>Your payment data is processed securely via SSL encryption. We never store your full card details.</p>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-redmix hover:bg-brand-red-light rounded-xl h-11 px-8 shadow-lg shadow-redmix/20">Add Card</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div 
            key={c.id} 
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-redmix/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-muted/50">
                <CreditCard className={cn("h-6 w-6", c.brand === "Visa" ? "text-blue-600" : "text-orange-500")} />
              </div>
              <button 
                onClick={() => removeCard(c.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-600 rounded-full hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground">•••• •••• •••• {c.n}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">{c.brand}</p>
                <p className="text-[10px] text-muted-foreground">Expires {c.e}</p>
              </div>
            </div>
          </div>
        ))}
        
        {cards.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium text-foreground">No cards saved yet</p>
            <p className="text-sm text-muted-foreground">Add a card to speed up your booking process</p>
          </div>
        )}
      </div>
    </div>
  );
}
