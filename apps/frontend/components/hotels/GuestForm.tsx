"use client";

import { useState } from "react";
import {
  User,
  Calendar,
  Home,
  Plus,
  Trash2,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  roomIds: string[];
  onSubmit: (
    guests: Array<{
      fullName: string;
      age: number;
      type: "ADULT" | "CHILD";
      roomId: string;
      preferences?: string;
    }>,
  ) => void;
}

export function GuestForm({ roomIds, onSubmit }: Props) {
  const [guests, setGuests] = useState<
    Array<{
      fullName: string;
      age: number | string;
      type: "ADULT" | "CHILD";
      roomId: string;
      preferences?: string;
    }>
  >([
    {
      fullName: "",
      age: "",
      type: "ADULT",
      roomId: roomIds[0] ?? "",
      preferences: "",
    },
  ]);

  const addGuest = () => {
    setGuests((prev) => [
      ...prev,
      {
        fullName: "",
        age: "",
        type: "ADULT",
        roomId: roomIds[0] ?? "",
        preferences: "",
      },
    ]);
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      setGuests((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateGuest = (index: number, field: string, value: any) => {
    const next = [...guests];
    (next[index] as any)[field] = value;
    setGuests(next);
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(guests as any);
      }}
    >
      <div className="space-y-6">
        {guests.map((guest, index) => (
          <div
            key={index}
            className="group relative p-6 bg-muted/20 rounded-3xl border border-border/50 hover:border-brand-red/20 transition-all animate-in fade-in slide-in-from-left-4 duration-500"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-red text-white flex items-center justify-center text-[10px]">
                  {index + 1}
                </span>
                Guest Information
              </h4>
              {guests.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGuest(index)}
                  className="p-2 text-muted-foreground hover:text-brand-red hover:bg-brand-red/5 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    required
                    className="w-full bg-background border border-border/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-hidden transition-all"
                    placeholder="Enter full name"
                    value={guest.fullName}
                    onChange={(e) =>
                      updateGuest(index, "fullName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    Age
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input
                      required
                      type="number"
                      min={0}
                      max={120}
                      className="w-full bg-background border border-border/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-hidden transition-all"
                      placeholder="Age"
                      value={guest.age}
                      onChange={(e) =>
                        updateGuest(index, "age", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    Category
                  </label>
                  <select
                    className="w-full bg-background border border-border/50 rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-hidden transition-all appearance-none"
                    value={guest.type}
                    onChange={(e) => updateGuest(index, "type", e.target.value)}
                  >
                    <option value="ADULT">Adult (18+)</option>
                    <option value="CHILD">Child (0-17)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  Assign to Room
                </label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <select
                    className="w-full bg-background border border-border/50 rounded-2xl py-3.5 pl-11 pr-10 text-xs font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-hidden transition-all appearance-none"
                    value={guest.roomId}
                    onChange={(e) =>
                      updateGuest(index, "roomId", e.target.value)
                    }
                  >
                    {roomIds.map((id) => (
                      <option key={id} value={id}>
                        Room #{id.slice(-4).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  Preferences (e.g. Non-smoking, Double Bed)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    className="w-full bg-background border border-border/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-hidden transition-all"
                    placeholder="Enter preferences"
                    value={guest.preferences}
                    onChange={(e) =>
                      updateGuest(index, "preferences", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={addGuest}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground font-bold text-xs hover:border-brand-red/50 hover:text-brand-red hover:bg-brand-red/[0.02] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Another Guest
        </button>
        <button
          type="submit"
          className="flex-[1.5] flex items-center justify-center gap-2 bg-slate-900 dark:bg-brand-red text-white py-4 rounded-2xl font-bold text-xs hover:shadow-2xl hover:shadow-brand-red/20 transition-all active:scale-95"
        >
          Proceed to Payment <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
