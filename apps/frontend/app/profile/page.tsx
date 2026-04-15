'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { DashboardTab } from '@/components/profile/DashboardTab';
import { AccountTab } from '@/components/profile/AccountTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/sections/Header';

export default function ProfilePage() {
  const session = useAuthSession();
  const [activeTab, setActiveTab] = useState('dashboard');

  const profile = useQuery({ 
    queryKey: ['profile-me'], 
    queryFn: () => apiFetch<any>('/profile/me'), 
    enabled: !!session.data 
  });

  if (!session.data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center space-y-4 px-4 py-20">
          <p className="rounded-xl border bg-amber-50 dark:bg-amber-900/20 p-6 text-amber-900 dark:text-amber-200 font-medium">
            Sign in required to view your profile.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (profile.isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow max-w-6xl w-full mx-auto py-12 px-4 space-y-8 animate-pulse">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </main>
        <Footer />
      </div>
    );
  }

  const userData = {
    name: profile.data?.profile?.firstName 
      ? `${profile.data.profile.firstName} ${profile.data.profile.lastName || ''}` 
      : (session.data?.firstName ? `${session.data.firstName} ${session.data.lastName || ''}`.trim() : 'Traveler'),
    email: profile.data?.profile?.email || session.data?.email || '',
    homeAirport: profile.data?.profile?.preferences?.homeAirport,
    avatarUrl: undefined,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="max-w-6xl mx-auto py-8 lg:py-12 px-4 md:px-8 space-y-8">
        
        {/* Profile Header section */}
        <ProfileHeader user={userData} />

        {/* Tabs System Container */}
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b mb-8 overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent h-14 w-full justify-start gap-8 px-0 rounded-none border-none">
              <TabsTrigger 
                value="dashboard" 
                className="relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent shadow-none px-1 text-base font-semibold transition-all hover:text-foreground/70"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent shadow-none px-1 text-base font-semibold transition-all hover:text-foreground/70"
              >
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent shadow-none px-1 text-base font-semibold transition-all hover:text-foreground/70"
              >
                Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="travelers" 
                className="relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent shadow-none px-1 text-base font-semibold transition-all hover:text-foreground/70"
              >
                Travelers
              </TabsTrigger>
              <TabsTrigger 
                value="payment" 
                className="relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent shadow-none px-1 text-base font-semibold transition-all hover:text-foreground/70"
              >
                Payment methods
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent shadow-none px-1 text-base font-semibold transition-all hover:text-foreground/70"
              >
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="pt-4 animate-in fade-in duration-500">
            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            
            <TabsContent value="account">
              <AccountTab initialData={profile.data?.profile} />
            </TabsContent>
            
            <TabsContent value="preferences">
              <PreferencesPlaceholder />
            </TabsContent>
            
            <TabsContent value="travelers">
              <TravelersPlaceholder />
            </TabsContent>
            
            <TabsContent value="payment">
               <div className="p-8 border rounded-2xl bg-muted/20 text-center space-y-4">
                  <h3 className="text-xl font-bold">No payment methods saved</h3>
                  <p className="text-muted-foreground">Save your card details for faster bookings.</p>
               </div>
            </TabsContent>
            
            <TabsContent value="notifications">
               <div className="p-8 border rounded-2xl bg-muted/20 text-center space-y-4">
                  <h3 className="text-xl font-bold">Preferences</h3>
                  <p className="text-muted-foreground">Manage how you want to be notified about deals and trips.</p>
               </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

function PreferencesPlaceholder() {
  return (
    <div className="p-12 border-2 border-dashed rounded-3xl text-center space-y-6">
      <div className="inline-flex items-center justify-center p-6 bg-muted rounded-full">
        <span className="text-5xl">⚙️</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-extrabold">Preferences</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Customize your travel preferences including seat choices, meal requirements, and more.
        </p>
      </div>
    </div>
  );
}

function TravelersPlaceholder() {
  return (
    <div className="p-12 border-2 border-dashed rounded-3xl text-center space-y-6">
      <div className="inline-flex items-center justify-center p-6 bg-muted rounded-full">
        <span className="text-5xl">👥</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-extrabold">Travelers</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Save details of your travel companions to make group bookings easier.
        </p>
      </div>
    </div>
  );
}
