"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { REVIEWS } from "@/data/reviews";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { AppImage } from "@/components/ui/app-image";
import { MessageSquare, Sparkles, Filter, Search, Star } from "lucide-react";
import { Review } from "@/lib/types/hotels";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2000&auto=format&fit=crop";

export default function CommunityReviewsPage() {
  // Map data/reviews.ts to lib/types/hotels.ts Review type
  const mappedReviews: Review[] = REVIEWS.map((rev, i) => ({
    id: rev.id || `rev-${i}`,
    userName: rev.name,
    userAvatar: rev.avatarUrl,
    rating: rev.rating,
    comment: rev.text,
    date: rev.date,
    isVerified: rev.isVerified || false,
    flightRating: rev.flightRating,
    hotelRating: rev.hotelRating,
    carRating: rev.carRating,
    supplierResponse: rev.supplierResponse,
    photos: rev.photos,
  }));

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <AppImage
            src={HERO_IMAGE}
            alt="Travel community"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />

        <div className="relative z-10 mx-auto flex min-h-[50vh] w-full max-w-[1400px] flex-col items-center justify-center px-4 pb-20 text-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-red/20 border border-brand-red/30 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] backdrop-blur-md text-brand-red">
              <Sparkles className="w-3.5 h-3.5" /> Community Voices
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              Verified{" "}
              <span className="bg-gradient-to-r from-redmix to-orange-400 bg-clip-text text-transparent">
                Experiences
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70 font-medium">
              Real stories from our global community of travelers. Transparent,
              verified, and always helpful.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats & Filters */}
      <section className="relative z-20 -mt-20 mx-auto w-full max-w-6xl px-4">
        <div className="grid md:grid-cols-3 gap-6 bg-card/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-border/50 shadow-2xl">
          <div className="flex items-center gap-6 p-4">
            <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red font-black text-3xl">
              4.9
            </div>
            <div>
              <div className="flex text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="text-sm font-black">Average Rating</p>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest">
                Global Satisfaction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 p-4 border-l border-border/50">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-black">12.5k+</p>
              <p className="text-sm font-black">Total Reviews</p>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest">
                Verified Stays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border-l border-border/50">
            <div className="flex-1 space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-red transition-colors" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  className="w-full bg-muted/50 border border-border/50 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                />
              </div>
            </div>
            <button className="p-3 bg-muted/50 rounded-2xl border border-border/50 hover:border-brand-red/30 transition-all group">
              <Filter className="w-5 h-5 text-muted-foreground group-hover:text-brand-red" />
            </button>
          </div>
        </div>
      </section>

      {/* Review Feed */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          {mappedReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center space-y-8">
          <p className="text-sm text-muted-foreground font-bold italic">
            Showing 5 of 12,542 verified reviews
          </p>
          <button className="px-12 py-5 bg-foreground text-background rounded-[2rem] font-black text-lg shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95">
            Load More Experiences
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
