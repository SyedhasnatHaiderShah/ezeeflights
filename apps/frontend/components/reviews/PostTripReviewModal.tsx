"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  X,
  ChevronRight,
  ChevronLeft,
  Upload,
  Camera,
  Sparkles,
  Gift,
  CheckCircle2,
  Plane,
  Hotel,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";

interface PostTripReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle?: string;
}

export function PostTripReviewModal({
  isOpen,
  onClose,
  tripTitle = "your London Getaway",
}: PostTripReviewModalProps) {
  const [step, setStep] = useState(1);
  const [ratings, setRatings] = useState({ flight: 0, hotel: 0, car: 0 });
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRating = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    toast({
      title: "Review submitted!",
      description: "250 points added to your account.",
      variant: "success",
    });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden bg-card/80 backdrop-blur-xl border border-border/50 rounded-[2.5rem] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-red/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-brand-red" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Trip Feedback</h3>
              <p className="text-[10px] text-muted-foreground font-medium tracking-widest">
                Post-Trip Review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-8"
              >
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <h4 className="text-xl font-bold tracking-tight">
                        How was your {tripTitle}?
                      </h4>
                      <p className="text-sm text-muted-foreground font-medium">
                        Rate each component of your journey.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {[
                        {
                          id: "flight",
                          label: "Flight Experience",
                          icon: Plane,
                        },
                        { id: "hotel", label: "Accommodation", icon: Hotel },
                        { id: "car", label: "Car Rental", icon: Car },
                      ].map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <cat.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-bold">
                              {cat.label}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() =>
                                  handleRating(
                                    cat.id as keyof typeof ratings,
                                    star,
                                  )
                                }
                                className={cn(
                                  "transition-all duration-300",
                                  ratings[cat.id as keyof typeof ratings] >=
                                    star
                                    ? "text-amber-500 scale-110"
                                    : "text-muted/30 hover:text-amber-500/50",
                                )}
                              >
                                <Star
                                  className={cn(
                                    "w-5 h-5",
                                    ratings[cat.id as keyof typeof ratings] >=
                                      star && "fill-current",
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={nextStep}
                      className="w-full py-6 rounded-2xl font-bold group"
                      disabled={!ratings.flight || !ratings.hotel}
                    >
                      Continue{" "}
                      <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold tracking-tight text-center">
                        Tell us more
                      </h4>
                      <p className="text-sm text-muted-foreground font-medium text-center">
                        Your stories help other travelers plan better.
                      </p>
                    </div>

                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Describe your experience, what you loved, and what could be improved..."
                      className="w-full min-h-[150px] p-5 bg-muted/30 border border-border/50 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                    />

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Attach Memories (Optional)
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-brand-red hover:text-brand-red transition-all group">
                          <Camera className="w-5 h-5 mb-1 group-hover:animate-bounce" />
                          <span className="text-[8px] font-bold">
                            Add Photo
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1 py-6 rounded-2xl font-bold"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!review || isSubmitting}
                        className="flex-2 py-6 rounded-2xl font-bold bg-brand-red hover:bg-brand-red/90"
                      >
                        {isSubmitting ? "Posting..." : "Submit Review"}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-8 py-10"
              >
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-emerald-500/20 rounded-full"
                  />
                  <div className="relative z-10 w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-2xl font-bold tracking-tight">
                    Experience Shared!
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium">
                    Thank you for contributing to the community.
                  </p>
                </div>

                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl space-y-3 animate-bounce">
                  <div className="flex items-center justify-center gap-2 text-amber-600 font-bold">
                    <Gift className="w-5 h-5" /> <span>+250 EzeePoints</span>
                  </div>
                  <p className="text-[10px] text-amber-700/70 font-bold tracking-widest">
                    Loyalty Incentive Awarded
                  </p>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full py-6 rounded-2xl font-bold"
                >
                  Return to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Progress */}
        {!isSuccess && (
          <div className="px-8 pb-8">
            <div className="flex gap-2 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full bg-brand-red transition-all duration-500",
                  step === 1 ? "w-1/2" : "w-full",
                )}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
