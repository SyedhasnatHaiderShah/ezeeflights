"use client";
import { Suspense } from "react";

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useProfile } from "@/lib/hooks/use-profile";
import { useToast } from "@/lib/hooks/use-toast";
import { logoutRequest } from "@/lib/api/auth-api";
import { isNative } from "@/lib/capacitor";
import { nextApiOrigin } from "@/lib/bff/config";
import {
  updateProfile,
  ProfileOverview,
  TravelPreferences,
  UserProfileRecord,
  changePassword,
} from "@/lib/api/profile";
import { validatePassword } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import {
  LogOut,
  Eye,
  EyeOff,
  User,
  Lock,
  Bell,
  Globe,
  Info,
  Moon,
  Calendar,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { ProfileForm } from "@/components/profile/ProfileForm";
// import { TravelPreferencesForm } from "@/components/profile/TravelPreferencesForm";
import { NotificationPreferencesForm } from "@/components/profile/NotificationPreferencesForm";
// import { PaymentMethods } from "@/components/profile/PaymentMethods";
import { Button } from "@/components/ui/button";
// import { TravelDocumentsPanel } from "@/components/travel-documents/TravelDocumentsPanel";
import { useTranslation } from "react-i18next";

const PROFILE_TABS = [
  "personal",
  "security",
  "notifications",
  "language",
  "about",
  "theme",
  "appointments",
  "help",
] as const;

function ProfilePageContent() {
  const { t } = useTranslation();
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const isMobileMenu = !rawTab; // If no tab is specified, we are in menu mode on mobile
  const activeContentTab = PROFILE_TABS.includes(rawTab as any)
    ? rawTab
    : "personal";

  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`/profile?${params.toString()}`);
  };

  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const safeCallbackUrl: Route = callbackUrl.startsWith("/")
    ? (callbackUrl as Route)
    : ("/profile" as Route);
  const profile = useProfile(!!session.data);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [resetLoading, setResetLoading] = useState(false);

  const [activeSession, setActiveSession] = useState<{
    browser?: string;
    os?: string;
    city?: string;
    loading: boolean;
  }>({ loading: true });

  useEffect(() => {
    if (activeContentTab !== "security") return;

    async function loadActiveSession() {
      try {
        const url = isNative()
          ? `${nextApiOrigin()}/api/useragent`
          : "/api/useragent";
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.data) {
          const { userAgent, location } = json.data;
          setActiveSession({
            browser: userAgent?.browser?.name || "Unknown Browser",
            os: userAgent?.os?.name || "Unknown OS",
            city: location?.city || location?.country || "Unknown Location",
            loading: false,
          });
        } else {
          setActiveSession((prev) => ({ ...prev, loading: false }));
        }
      } catch (e) {
        console.error("Failed to load active session user agent info", e);
        setActiveSession((prev) => ({ ...prev, loading: false }));
      }
    }
    loadActiveSession();
  }, [activeContentTab]);

  const handleLogout = async () => {
    await logoutRequest();
    queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    queryClient.invalidateQueries({ queryKey: ["profile-me"] });
    try {
      window.sessionStorage.setItem("auth-modal-suppress-next-open", "1");
    } catch {}
    router.push("/");
  };

  if (session.isLoading || profile.isLoading)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="max-w-6xl mx-auto w-full py-12 px-4 space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-[420px] w-full rounded-2xl" />
        </main>
      </div>
    );

  if (!session.data)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="grow flex items-center justify-center">
          <p className="rounded-xl border border-foreground bg-background p-5 text-foreground dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-500">
            {t("Sign in required to view your profile.")}
          </p>
        </main>
      </div>
    );

  const profileData = profile.data as ProfileOverview | undefined;
  const p: UserProfileRecord = {
    firstName: profileData?.firstName,
    middleName: profileData?.middleName,
    lastName: profileData?.lastName,
    phone: profileData?.phone,
    nationality: profileData?.nationality,
    passportNumber: profileData?.passportNumber,
    passportExpiry: profileData?.passportExpiry || "",
    dateOfBirth: profileData?.dateOfBirth ?? undefined,
    gender: profileData?.gender ?? undefined,
    ...(profileData?.profile ?? {}),
  };
  // Ensure we don't overwrite with nulls from profile if root has values
  if (profileData?.firstName) p.firstName = profileData.firstName;
  if (profileData?.middleName) p.middleName = profileData.middleName;
  if (profileData?.lastName) p.lastName = profileData.lastName;
  if (profileData?.phone) p.phone = profileData.phone;
  if (profileData?.nationality) p.nationality = profileData.nationality;
  if (profileData?.passportNumber)
    p.passportNumber = profileData.passportNumber;
  if (profileData?.passportExpiry)
    p.passportExpiry = profileData.passportExpiry;
  if (profileData?.dateOfBirth) p.dateOfBirth = profileData.dateOfBirth;
  if (profileData?.gender) p.gender = profileData.gender;
  const preferences: TravelPreferences =
    profileData?.preferences ?? p.preferences ?? {};
  const name = p.firstName
    ? `${p.firstName} ${p.lastName || ""}`.trim()
    : `${session.data.firstName || ""} ${session.data.lastName || ""}`.trim() ||
      t("Traveler");
  const email = p.email || session.data.email || "";

  return (
    <div className="min-h-screen bg-background mb-8">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 p-5 py-8 mt-16 lg:grid-cols-[260px_1fr]">
        <aside
          className={cn(
            "h-fit w-full lg:block",
            isMobileMenu ? "block" : "hidden",
          )}
        >
          {/* Profile Header */}
          <div className="mb-5 flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-redmix text-2xl font-bold text-white shadow-md">
              {name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-foreground">
                {name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-5">
            {/* Account Section */}
            <div>
              <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">
                {t("Account")}
              </h3>
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <nav className="flex flex-col">
                  <button
                    onClick={() => handleTabChange("personal")}
                    className="flex items-center justify-between border-b border-border/50 px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <User className="h-4 w-4" /> {t("Manage Profile")}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleTabChange("security")}
                    className="flex items-center justify-between border-b border-border/50 px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <Lock className="h-4 w-4" /> {t("Password & Security")}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleTabChange("notifications")}
                    className="flex items-center justify-between border-b border-border/50 px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <Bell className="h-4 w-4" /> {t("Notifications")}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleTabChange("language")}
                    className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <Globe className="h-4 w-4" /> {t("Language")}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      English <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Preferences Section */}
            {/* <div>
              <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">
                {t("Preferences")}
              </h3>
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <nav className="flex flex-col">
                  <button
                    onClick={() => handleTabChange("about")}
                    className="flex items-center justify-between border-b border-border/50 px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <Info className="h-4 w-4" /> {t("About Us")}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleTabChange("theme")}
                    className="flex items-center justify-between border-b border-border/50 px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <Moon className="h-4 w-4" /> {t("Theme")}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      Light <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                  <button
                    onClick={() => handleTabChange("appointments")}
                    className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <Calendar className="h-4 w-4" /> {t("Appointments")}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </nav>
              </div>
            </div> */}

            {/* Support Section */}
            <div>
              <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">
                {t("Support")}
              </h3>
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <nav className="flex flex-col">
                  <button
                    onClick={() => handleTabChange("help")}
                    className="flex items-center justify-between border-b border-border/50 px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <HelpCircle className="h-4 w-4" /> {t("Help Center")}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between px-4 py-3.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <LogOut className="h-4 w-4" /> {t("Sign Out")}
                    </div>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </aside>

        <section
          className={cn(" bg-card", isMobileMenu ? "hidden lg:block" : "block")}
        >
          <Tabs
            value={activeContentTab as string}
            onValueChange={handleTabChange}
          >
            {!isMobileMenu && (
              <div className="mb-6 flex items-center lg:hidden">
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-redmix bg-muted/50 px-3 py-2 rounded-xl"
                >
                  <ChevronLeft className="h-5 w-5" />
                  {t("Back to Menu")}
                </button>
              </div>
            )}
            <TabsContent value="personal">
              <ProfileForm
                initial={p}
                onSave={async (payload) => {
                  await updateProfile(payload);
                  await queryClient.invalidateQueries({
                    queryKey: ["profile-me"],
                  });
                  router.push(safeCallbackUrl);
                }}
              />
            </TabsContent>
            {/* --- Preferences / Documents / Payment (commented out; enable later) --- */}
            {/* <TabsContent value="preferences">
              <TravelPreferencesForm
                initial={preferences}
                onSave={async (payload) => {
                  await updateProfile(payload);
                  await queryClient.invalidateQueries({
                    queryKey: ["profile-me"],
                  });
                  router.push(safeCallbackUrl);
                }}
              />
            </TabsContent>
            <TabsContent value="documents">
              <TravelDocumentsPanel
                title={t("My Travel Documents")}
                profileAware
                showCompliance
                onProfileUpdated={async () => {
                  await queryClient.invalidateQueries({
                    queryKey: ["profile-me"],
                  });
                }}
              />
            </TabsContent>
            <TabsContent value="payment">
              <PaymentMethods />
            </TabsContent> */}
            <TabsContent value="notifications">
              <NotificationPreferencesForm
                initial={preferences}
                onSave={async (payload) => {
                  await updateProfile(payload);
                  await queryClient.invalidateQueries({
                    queryKey: ["profile-me"],
                  });
                  router.push(safeCallbackUrl);
                }}
              />
            </TabsContent>
            <TabsContent value="security">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {profileData?.hasPassword
                    ? t("Change password")
                    : t("Set password")}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {profileData?.hasPassword && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("Current Password")}
                      </Label>
                      <div className="relative">
                        <Input
                          placeholder={t("Enter current password")}
                          type={showCurrentPassword ? "text" : "password"}
                          className="pr-10"
                          value={passwords.current}
                          onChange={(e) =>
                            setPasswords((p) => ({
                              ...p,
                              current: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-redmix transition-colors"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {profileData?.hasPassword
                        ? t("New Password")
                        : t("Password")}
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder={t("Enter new password")}
                        type={showNewPassword ? "text" : "password"}
                        className="pr-10"
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords((p) => ({ ...p, new: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-redmix transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("Confirm Password")}
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder={t("Confirm new password")}
                        type={showConfirmPassword ? "text" : "password"}
                        className="pr-10"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            confirm: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-redmix transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    className="bg-redmix hover:bg-brand-red-light rounded-xl px-8"
                    onClick={async () => {
                      if (profileData?.hasPassword && !passwords.current)
                        return;
                      if (!passwords.new || !passwords.confirm) return;
                      if (passwords.new !== passwords.confirm) {
                        toast({
                          title: t("Error"),
                          description: t("Passwords do not match"),
                          variant: "destructive",
                        });
                        return;
                      }
                      const pwdError = validatePassword(passwords.new);
                      if (pwdError) {
                        toast({
                          title: t("Error"),
                          description: t(pwdError),
                          variant: "destructive",
                        });
                        return;
                      }
                      setResetLoading(true);
                      try {
                        await changePassword(
                          profileData?.hasPassword
                            ? passwords.current
                            : undefined,
                          passwords.new,
                        );
                        toast({
                          title: t("Success"),
                          description: profileData?.hasPassword
                            ? t("Password updated successfully!")
                            : t("Password set successfully!"),
                          variant: "success",
                        });
                        setPasswords({ current: "", new: "", confirm: "" });
                      } catch (err: any) {
                        let errorMessage = t(
                          "Failed to update password. Please try again.",
                        );
                        try {
                          const parsed = JSON.parse(err.message);
                          if (parsed.message) {
                            errorMessage = Array.isArray(parsed.message)
                              ? parsed.message[0]
                              : parsed.message;
                          }
                        } catch {
                          if (err.message && !err.message.includes("{")) {
                            errorMessage = err.message;
                          }
                        }
                        toast({
                          title: t("Error"),
                          description: errorMessage,
                          variant: "destructive",
                        });
                      } finally {
                        setResetLoading(false);
                      }
                    }}
                    disabled={
                      resetLoading ||
                      (profileData?.hasPassword ? !passwords.current : false) ||
                      !passwords.new ||
                      !passwords.confirm
                    }
                  >
                    {resetLoading
                      ? t("Updating...")
                      : profileData?.hasPassword
                        ? t("Save Changes")
                        : t("Set Password")}
                  </Button>
                </div>
                {/* <label className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      Two-factor authentication
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch />
                </label> */}
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="font-bold text-foreground">
                    {t("Active sessions")}
                  </p>
                  <table className="mt-3 w-full text-sm">
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="py-3 text-muted-foreground">
                          {activeSession.loading ? (
                            <span className="animate-pulse">
                              {t("Loading active session...")}
                            </span>
                          ) : (
                            `${activeSession.browser} ${t("on")} ${activeSession.os} • ${activeSession.city}`
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                            {t("Current")}
                          </span>
                        </td>
                      </tr>
                      {/* <tr className="border-t border-border">
                        <td className="py-3 text-muted-foreground">
                          iPhone • Dubai
                        </td>
                        <td className="py-3 text-right">
                          <button className="font-medium text-brand-red hover:underline">
                            Revoke
                          </button>
                        </td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="language">
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                {t("Language settings coming soon")}
              </div>
            </TabsContent>
            <TabsContent value="about">
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                {t("About Us coming soon")}
              </div>
            </TabsContent>
            <TabsContent value="theme">
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                {t("Theme settings coming soon")}
              </div>
            </TabsContent>
            <TabsContent value="appointments">
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                {t("Appointments coming soon")}
              </div>
            </TabsContent>
            <TabsContent value="help">
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                {t("Help Center coming soon")}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

// Suspense-wrapped
export default function ProfilePage(props: any) {
  return (
    <Suspense fallback={null}>
      <ProfilePageContent {...props} />
    </Suspense>
  );
}
