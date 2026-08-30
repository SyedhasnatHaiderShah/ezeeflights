'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Utensils, 
  Coffee, 
  Moon, 
  Sun,
  AlertCircle,
  Share2,
  Trash2,
  Plus,
  GripVertical,
  ChevronRight,
  ArrowRight,
  Loader2,
  Info,
  CheckCircle2,
  X,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ITINERARY, FullItinerary, ItineraryActivity, ItineraryDay } from '@/data/mock-ai-planner';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/hooks/use-toast';

// ─── Types & Sub-components ──────────────────────────────────────────────────

function SlotIcon({ slot }: { slot: string }) {
  if (slot === 'morning') return <Coffee className="h-3.5 w-3.5 text-amber-500" />;
  if (slot === 'afternoon') return <Sun className="h-3.5 w-3.5 text-orange-500" />;
  return <Moon className="h-3.5 w-3.5 text-indigo-500" />;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SmartTravelPlannerPage() {
  const [prompt, setPrompt] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState(0);
  const [itinerary, setItinerary] = React.useState<FullItinerary | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  // Generation sequence simulation
  const generationSteps = [
    "Analyzing your preferences...",
    "Searching flights and connections...",
    "Curating local experiences...",
    "Optimizing travel routes...",
    "Finalizing your personalized plan..."
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGenerationStep(0);

    // Simulate multi-step generation
    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }
    
    setItinerary(MOCK_ITINERARY);
    setIsGenerating(false);
    toast({
      title: "Itinerary Generated!",
      description: "We've created a custom 7-day plan based on your vision.",
      variant: "success"
    });
  };

  const handleCopyLink = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Link Copied!",
      description: "The shareable link has been copied to your clipboard.",
    });
  };

  // ── Drag and Drop Logic ───────────────────────────────────────────────────
  const [draggedActivity, setDraggedActivity] = React.useState<{ dayIdx: number; slot: 'morning' | 'afternoon' | 'evening'; activityIdx: number } | null>(null);

  const handleDragStart = (dayIdx: number, slot: 'morning' | 'afternoon' | 'evening', activityIdx: number) => {
    setDraggedActivity({ dayIdx, slot, activityIdx });
  };

  const handleDrop = (targetDayIdx: number, targetSlot: 'morning' | 'afternoon' | 'evening') => {
    if (!draggedActivity || !itinerary) return;

    const newItinerary = { ...itinerary };
    const sourceDay = newItinerary.days[draggedActivity.dayIdx];
    const targetDay = newItinerary.days[targetDayIdx];
    
    // Remove from source
    const [movedItem] = sourceDay.slots[draggedActivity.slot].splice(draggedActivity.activityIdx, 1);
    
    // Add to target
    targetDay.slots[targetSlot].push(movedItem);
    
    setItinerary(newItinerary);
    setDraggedActivity(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-20 transition-colors">
      <div className="mx-auto max-w-screen-xl px-4 pt-12 md:px-6">
        
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-red/10 border border-brand-red/20 px-3 py-1 text-[10px] font-black tracking-widest text-brand-red">
            <Sparkles className="h-3.5 w-3.5" />
            AI POWERED PLANNING
          </div>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Trip <span className="text-brand-red">Planner</span>
          </h1>
          <p className="max-w-xl text-base font-medium text-muted-foreground">
            Describe your dream trip in natural language. Our AI analyzes flights, stays, and hidden gems to curate your perfect escape.
          </p>
        </div>

        {!itinerary && !isGenerating && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl"
          >
            {/* ── Magic Prompt Input ────────────────────────────────── */}
            <form onSubmit={handleGenerate} className="group relative overflow-hidden rounded-[2rem] bg-card border border-border/50 p-2 shadow-2xl transition-all hover:border-brand-red/30">
              <div className="flex flex-col gap-2 p-4 md:flex-row md:items-center">
                <div className="flex-1 space-y-1 pl-2">
                  <label className="text-xs font-bold text-muted-foreground/60 tracking-wider">Describe your dream journey</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Plan a 6-night adventure in Bali. I love ancient temples, surfing spots, and vibrant local night markets..."
                    className="w-full resize-none bg-transparent text-lg font-bold placeholder:text-muted-foreground/30 focus:outline-none"
                    rows={2}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="h-16 w-full rounded-2xl bg-brand-red text-white font-black text-lg transition-all active:scale-95 disabled:opacity-50 md:w-auto md:px-8"
                >
                  Create Plan
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
              
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 px-6 pb-6 pt-2">
                {[
                  "Tokyo Foodie Trail",
                  "Maldives Luxury Escape",
                  "Swiss Alps Adventure",
                  "Family Orlando Fun"
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPrompt(s)}
                    className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-bold text-muted-foreground transition-all hover:border-brand-red/20 hover:bg-brand-red/5 hover:text-brand-red"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </form>
          </motion.div>
        )}

        {/* ── Loading State ───────────────────────────────────────── */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative mb-10">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-brand-red/20 blur-3xl rounded-full"
                />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-card border border-border shadow-2xl">
                  <Sparkles className="h-10 w-10 text-brand-red animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-black">{generationSteps[generationStep]}</h2>
              <p className="mt-2 text-sm text-muted-foreground font-medium">Sit back while we architect your escape.</p>
              
              <div className="mt-12 flex gap-4">
                {generationSteps.map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "h-1.5 w-12 rounded-full transition-all duration-500",
                      i <= generationStep ? "bg-brand-red" : "bg-muted"
                    )} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Itinerary Content ───────────────────────────────────── */}
        {itinerary && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-10 lg:grid-cols-[1fr_350px]"
          >
            {/* Main Planner */}
            <div className="space-y-12">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{itinerary.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      <MapPin className="w-3 h-3 text-brand-red" /> {itinerary.destination}
                    </span>
                    <span className="w-1 h-1 bg-border rounded-full" />
                    <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      <Calendar className="w-3 h-3" /> {itinerary.duration}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)} className="rounded-xl font-bold">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                  <Button variant="brand-red" size="sm" className="rounded-xl font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Add Stop
                  </Button>
                </div>
              </div>

              {itinerary.days.map((day, dIdx) => (
                <section key={day.day} className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white font-black text-sm">
                      D{day.day}
                    </div>
                    <div>
                      <h3 className="text-lg font-black">{day.date}</h3>
                      <p className="text-xs text-muted-foreground font-medium">Ubud Exploration & Cultural Immersion</p>
                    </div>
                  </div>

                  <div className="grid gap-8">
                    {(['morning', 'afternoon', 'evening'] as const).map((slot) => (
                      <div 
                        key={slot} 
                        onDragOver={onDragOver}
                        onDrop={() => handleDrop(dIdx, slot)}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">
                          <SlotIcon slot={slot} />
                          {slot}
                        </div>
                        
                        <div className="grid gap-4">
                          {day.slots[slot].length === 0 && (
                            <div className="flex items-center justify-center rounded-3xl border border-dashed border-border/50 py-10 bg-muted/20 text-muted-foreground/40 text-xs font-bold">
                              Drop activities here to reschedule
                            </div>
                          )}
                          {day.slots[slot].map((activity, aIdx) => (
                            <div
                              key={activity.id}
                              draggable
                              onDragStart={() => handleDragStart(dIdx, slot, aIdx)}
                              className={cn(
                                "group relative flex items-start gap-4 rounded-3xl border border-border/40 bg-card p-5 transition-all hover:border-brand-red/30 hover:shadow-xl hover:shadow-black/5",
                                activity.type === 'transport' && "bg-blue-500/5 border-blue-500/20"
                              )}
                            >
                              <div className="mt-1 shrink-0 cursor-grab active:cursor-grabbing">
                                <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                              </div>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase",
                                      activity.type === 'transport' ? "bg-blue-500/10 text-blue-500" : 
                                      activity.type === 'meal' ? "bg-emerald-500/10 text-emerald-500" :
                                      "bg-brand-red/10 text-brand-red"
                                    )}>
                                      {activity.type}
                                    </span>
                                    <p className="text-sm font-black tracking-tight">{activity.title}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                                    <Clock className="w-3 h-3" /> {activity.time} · {activity.duration}
                                  </div>
                                </div>
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed">{activity.description}</p>
                                
                                {activity.bufferAfter && (
                                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/5 px-2 py-1 text-[10px] font-bold text-amber-600 border border-amber-500/10">
                                    <AlertCircle className="h-3 w-3" />
                                    {activity.bufferAfter}
                                  </div>
                                )}
                              </div>

                              <div className="opacity-0 transition-opacity group-hover:opacity-100 flex gap-1">
                                <button className="p-2 text-muted-foreground/40 hover:text-brand-red transition-colors">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                                <button className="p-2 text-muted-foreground/40 hover:text-red-500 transition-colors">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Sidebar Controls */}
            <aside className="space-y-6">
              <div className="sticky top-24 space-y-6">
                
                {/* AI Alerts Panel */}
                <div className="space-y-4 rounded-3xl bg-foreground text-background p-6 shadow-2xl">
                  <div className="flex items-center gap-2 text-[10px] font-black text-brand-red tracking-widest uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Intelligence
                  </div>
                  <div className="space-y-3">
                    {itinerary.alerts.map((alert) => (
                      <div key={alert.id} className={cn(
                        "flex gap-3 rounded-2xl p-4 text-[11px] font-bold leading-relaxed border",
                        alert.type === 'holiday' ? "bg-red-500/10 border-red-500/20 text-red-500" : 
                        alert.type === 'delay' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                        "bg-blue-500/10 border-blue-500/20 text-blue-500"
                      )}>
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <div>
                          {alert.day && <span className="block mb-0.5 opacity-60">Day {alert.day}</span>}
                          {alert.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="space-y-6 rounded-3xl border border-border/50 bg-card p-6 shadow-xl shadow-black/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">Estimated Budget</p>
                    <p className="text-2xl font-black">$2,450.00 <span className="text-sm text-muted-foreground font-bold">/ total</span></p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button className="w-full h-12 rounded-2xl bg-brand-red font-black text-white shadow-lg shadow-brand-red/20 transition-all hover:scale-[1.02] active:scale-95">
                      Confirm & Book Trip
                    </Button>
                    <p className="text-center text-[10px] font-bold text-muted-foreground">Price includes flights, 6 nights in Ubud, and 3 activities.</p>
                  </div>
                </div>

                {/* Export Helper */}
                <div className="flex items-center gap-4 rounded-3xl border border-border/50 bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-sm">
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Smart Tip</p>
                    <p className="text-[10px] font-bold text-muted-foreground/60">Drag activities to rearrange. The AI will auto-adjust buffer times for you.</p>
                  </div>
                </div>

              </div>
            </aside>
          </motion.div>
        )}
      </div>

      {/* ── Share Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden bg-card border border-border rounded-[2.5rem] shadow-2xl p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black">Share Itinerary</h3>
                  <p className="text-xs text-muted-foreground font-medium">Allow others to view and collaborate on this plan.</p>
                </div>
                <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">Public Link</p>
                  <div className="flex items-center gap-2">
                    <input 
                      readOnly 
                      value="https://ezeeflights.com/itinerary/bali-001" 
                      className="flex-1 bg-transparent text-sm font-bold outline-none"
                    />
                    <button 
                      onClick={handleCopyLink}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        isCopied ? "bg-emerald-500 text-white" : "bg-card border border-border hover:bg-muted"
                      )}
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="rounded-xl font-bold h-12">
                    Invite by Email
                  </Button>
                  <Button variant="brand-red" className="rounded-xl font-bold h-12">
                    Download PDF
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
