"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  Award, 
  Gift, 
  Users, 
  History, 
  ChevronRight, 
  Copy, 
  Check, 
  Star, 
  Zap,
  Calendar,
  Sparkles,
  Medal,
  Info
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/Progress";
import { 
  mockUserData, 
  mockRewardHistory, 
  mockBadges, 
  mockLeaderboard, 
  rewardTiers 
} from "@/data/mock-rewards";
import { cn } from "@/lib/utils";

export default function RewardsPage() {
  const [copied, setCopied] = useState(false);
  
  const currentTier = rewardTiers.find(t => t.name === mockUserData.tier) || rewardTiers[0];
  const nextTier = rewardTiers[rewardTiers.indexOf(currentTier) + 1];
  const progress = nextTier ? (mockUserData.currentPoints / nextTier.minPoints) * 100 : 100;

  const copyReferral = () => {
    navigator.clipboard.writeText(mockUserData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      
      <main className="mx-auto max-w-screen-xl px-4 py-24 md:py-32">
        {/* Header Section */}
        <section className="mb-12">
           <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/40">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 p-12 opacity-10">
                 <Trophy className="w-64 h-64 rotate-12" />
              </div>
              <div className="absolute bottom-0 left-0 p-12 opacity-10">
                 <Sparkles className="w-48 h-48 -rotate-12" />
              </div>

              <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_350px]">
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <Badge className={cn("px-4 py-1 text-sm font-black uppercase tracking-widest", currentTier.color)}>
                          {mockUserData.tier} Member
                       </Badge>
                       <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Member since 2022
                       </div>
                    </div>
                    
                    <div>
                       <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Available Points</p>
                       <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
                          {mockUserData.currentPoints.toLocaleString()} <span className="text-2xl text-slate-500 uppercase tracking-widest ml-2">PTS</span>
                       </h1>
                    </div>

                    {nextTier && (
                       <div className="max-w-md space-y-3 pt-4">
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                             <span>Progress to {nextTier.name}</span>
                             <span>{nextTier.minPoints.toLocaleString()} PTS</span>
                          </div>
                          <Progress value={progress} className="h-3 bg-white/10" />
                          <p className="text-xs text-slate-400 font-medium">
                             You need {(nextTier.minPoints - mockUserData.currentPoints).toLocaleString()} more points to unlock {nextTier.name} benefits.
                          </p>
                       </div>
                    )}
                 </div>

                 <div className="flex flex-col justify-between p-6 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                             <Calendar className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expiring Soon</p>
                             <p className="font-black text-xl">{mockUserData.expiringSoon} PTS</p>
                          </div>
                       </div>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed">
                          Your points will expire on {new Date(mockUserData.expiryDate).toLocaleDateString()}. Make a booking to extend!
                       </p>
                    </div>
                    <Button className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl mt-6">
                       Redeem Points
                    </Button>
                 </div>
              </div>
           </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Main Content Area */}
          <div className="space-y-12">
            
            {/* Referral Hub */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50">
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="h-40 w-40 rounded-[2rem] bg-redmix/10 flex items-center justify-center shrink-0">
                     <Users className="w-20 h-20 text-redmix" />
                  </div>
                  <div className="space-y-4 flex-1">
                     <h2 className="text-2xl font-black tracking-tight">Refer a Friend, Get Rewards</h2>
                     <p className="text-slate-500 font-medium">Share your unique code. Both you and your friend will receive <span className="text-slate-900 dark:text-white font-bold">1,000 bonus points</span> on their first successful booking.</p>
                     
                     <div className="flex gap-2">
                        <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 flex items-center justify-between font-mono font-black text-lg">
                           {mockUserData.referralCode}
                           <button onClick={copyReferral} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                              {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5 text-slate-400" />}
                           </button>
                        </div>
                        <Button className="h-14 px-8 bg-redmix text-white font-black rounded-xl">Share Code</Button>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Award className="h-3 w-3" /> {mockUserData.totalReferrals} Friends already joined
                     </p>
                  </div>
               </div>
            </section>

            {/* Badges & Achievements */}
            <section>
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                     <Medal className="h-6 w-6 text-indigo-500" /> Milestone Badges
                  </h2>
                  <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-indigo-500">View All</Button>
               </div>
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {mockBadges.map(badge => (
                     <div key={badge.id} className={cn(
                        "p-6 rounded-[2rem] border transition-all duration-300 text-center",
                        badge.earned 
                          ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-100" 
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-900 grayscale opacity-50"
                     )}>
                        <div className="text-4xl mb-3">{badge.icon}</div>
                        <p className="font-black text-sm mb-1">{badge.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-tight">{badge.description}</p>
                     </div>
                  ))}
               </div>
            </section>

            {/* Activity History */}
            <section>
               <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 mb-6">
                  <History className="h-6 w-6 text-slate-400" /> Points History
               </h2>
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                     {mockRewardHistory.map(tx => (
                        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                 "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                                 tx.type === "Earned" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                              )}>
                                 {tx.type === "Earned" ? <Zap className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 dark:text-white">{tx.source}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={cn("text-xl font-black", tx.points > 0 ? "text-emerald-500" : "text-red-500")}>
                                 {tx.points > 0 ? "+" : ""}{tx.points.toLocaleString()}
                              </p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tx.status}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-8">
            <div className="sticky top-24 space-y-8">
               
               {/* Leaderboard */}
               <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/30 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Medal className="w-32 h-32 rotate-12" />
                  </div>
                  
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> Top Explorers
                  </h3>

                  <div className="space-y-4 relative z-10">
                     {mockLeaderboard.map((entry, idx) => (
                        <div key={idx} className={cn(
                           "flex items-center justify-between p-4 rounded-2xl border transition-all",
                           entry.isCurrentUser 
                             ? "bg-white text-indigo-600 border-white shadow-xl shadow-indigo-900/40" 
                             : "bg-white/5 border-white/10 text-white/90"
                        )}>
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-black opacity-50 w-4">{entry.rank}</span>
                              <p className="font-black text-sm">{entry.name}</p>
                           </div>
                           <p className="font-black text-xs">{entry.points.toLocaleString()} PTS</p>
                        </div>
                     ))}
                  </div>
                  
                  <Button variant="ghost" className="w-full mt-6 text-white/60 hover:text-white font-black uppercase tracking-widest text-[10px]">
                     View Full Leaderboard <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
               </section>

               {/* Ways to Earn */}
               <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> Boost Your Points
                  </h3>
                  
                  <div className="grid gap-3">
                     {[
                        { title: "Review Your Trip", reward: "250 PTS", icon: <Award className="h-5 w-5" /> },
                        { title: "Partner Car Rental", reward: "2x PTS", icon: <Medal className="h-5 w-5" /> },
                        { title: "Birthday Bonus", reward: "1,000 PTS", icon: <Gift className="h-5 w-5" /> },
                     ].map((way, idx) => (
                        <div key={idx} className="group p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] flex items-center justify-between hover:border-redmix/30 transition-all cursor-pointer">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-redmix group-hover:text-white transition-all">
                                 {way.icon}
                              </div>
                              <p className="text-xs font-black tracking-tight">{way.title}</p>
                           </div>
                           <span className="text-[10px] font-black text-redmix uppercase tracking-widest">{way.reward}</span>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Info Card */}
               <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-start gap-4">
                  <Info className="h-6 w-6 text-indigo-400 shrink-0 mt-1" />
                  <div className="space-y-1">
                    <p className="font-black text-sm">Points Policy</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">Points are awarded 48 hours after your trip completion. Rolling 12-month expiry applies.</p>
                  </div>
               </div>

            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}
