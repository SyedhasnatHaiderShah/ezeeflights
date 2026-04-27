"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useProfile } from "@/lib/hooks/use-profile";
import { logoutRequest } from "@/lib/api/auth-api";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { LogOut } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TravelerList } from "@/components/profile/TravelerList";
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
  const session = useAuthSession();
  const [activeTab, setActiveTab] = useState("personal");
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const safeCallbackUrl: Route = callbackUrl.startsWith("/")
    ? (callbackUrl as Route)
    : ("/profile" as Route);
  const profile = useProfile(!!session.data);

  const handleLogout = async () => {
    await logoutRequest();
    queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    queryClient.invalidateQueries({ queryKey: ["profile-me"] });
    router.push("/");
  };

  if (!session.data)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="grow flex items-center justify-center">
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-500">
            Sign in required to view your profile.
          </p>
        </main>
        <Footer />
      </div>
    );
  if (profile.isLoading)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="max-w-6xl mx-auto w-full py-12 px-4 space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-105 w-full rounded-2xl" />
        </main>
        <Footer />
      </div>
    );

  const p = profile.data?.profile ?? {};
  const name = p.firstName
    ? `${p.firstName} ${p.lastName || ""}`.trim()
    : `${session.data.firstName || ""} ${session.data.lastName || ""}`.trim() ||
      "Traveler";
  const email = p.email || session.data.email || "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-8 mt-20 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-2xl border bg-card p-5 lg:block">
          <button className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-redmix text-2xl font-bold text-white">
            {name.charAt(0)}
          </button>
          <h2 className="mt-4 text-center text-xl font-bold">{name}</h2>
          <p className="text-center text-sm text-muted-foreground">{email}</p>
          <p className="mx-auto mt-3 w-fit rounded-full bg-brand-yellow/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-yellow border border-brand-yellow/30">
            Gold Member
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Member since 2023
          </p>
          <nav className="mt-5 space-y-1 text-sm">
            {[
              ["personal", "Personal Info"],
              ["travelers", "My Travelers"],
              ["payment", "Payment Methods"],
              ["notifications", "Notifications"],
              ["security", "Security"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                  activeTab === key
                    ? "bg-redmix/10 text-brand-red shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-all mt-4"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </aside>

        <section className="rounded-2xl border bg-card p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-5 h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 lg:hidden">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="travelers">Travelers</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-950/30 ml-auto"
              >
                Sign Out
              </button>
            </TabsList>
            <TabsContent value="personal">
              <ProfileForm
                initial={p}
                onSave={async (payload) => {
                  await apiFetch("/profile/me", {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                  });
                  await queryClient.invalidateQueries({ queryKey: ["profile-me"] });
                  router.push(safeCallbackUrl);
                }}
              />
            </TabsContent>
            <TabsContent value="travelers">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">My Travelers</h3>
                  <button className="rounded-lg bg-redmix px-3 py-2 text-sm text-white">
                    Add Traveler
                  </button>
                </div>
                <TravelerList
                  travelers={p.travelers ?? []}
                  onDelete={(id) =>
                    apiFetch(`/travelers/${id}`, { method: "DELETE" })
                  }
                />
              </div>
            </TabsContent>
            <TabsContent value="payment">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { n: "4242", e: "12/28" },
                  { n: "1881", e: "04/27" },
                ].map((c) => (
                  <div key={c.n} className="rounded-xl border border-border bg-background/50 p-4 transition-all hover:border-brand-red/30">
                    <p className="font-bold text-foreground">💳 •••• {c.n}</p>
                    <p className="text-xs text-muted-foreground mt-1">Expiry {c.e}</p>
                  </div>
                ))}
                <button className="flex items-center justify-center rounded-xl border border-dashed border-brand-red/40 bg-brand-red/5 p-4 text-sm font-semibold text-brand-red transition-all hover:bg-brand-red/10">
                  + Add New Card
                </button>
              </div>
            </TabsContent>
            <TabsContent value="notifications">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Flight updates",
                  "Price alerts",
                  "Promotional offers",
                  "Email",
                  "SMS",
                  "Push",
                ].map((label) => (
                  <label
                    key={label}
                    className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4 text-sm transition-all hover:border-brand-red/20"
                  >
                    <span className="font-medium text-foreground">{label}</span>
                    <Switch defaultChecked />
                  </label>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="security">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Change password</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Password</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
                      placeholder="Enter current password"
                      type="password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
                      placeholder="Enter new password"
                      type="password"
                    />
                  </div>
                </div>
                <label className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </label>
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="font-bold text-foreground">Active sessions</p>
                  <table className="mt-3 w-full text-sm">
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="py-3 text-muted-foreground">Chrome • New York</td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">Current</span>
                        </td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 text-muted-foreground">iPhone • Dubai</td>
                        <td className="py-3 text-right">
                          <button className="font-medium text-brand-red hover:underline">Revoke</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
}
