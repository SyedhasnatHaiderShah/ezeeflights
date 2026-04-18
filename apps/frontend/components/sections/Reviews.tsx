"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { SectionHeader } from "@/components/ui/section-header";
import { RatingStars } from "@/components/ui/rating-stars";
import { REVIEWS } from "@/data/reviews";

export function Reviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi || paused) return;
    const id = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [emblaApi, paused]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActive(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") emblaApi.scrollPrev();
      if (e.key === "ArrowRight") emblaApi.scrollNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [emblaApi]);

  return (
    <section className="bg-[#0d2353] py-14" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader eyebrow="TESTIMONIALS" title="What Travelers Say" light />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {REVIEWS.slice(0, 8).map((review, idx) => (
              <article key={`${review.name}-${idx}`} className="relative flex-[0_0_100%] md:flex-[0_0_50%] rounded-2xl bg-white p-5">
                <span className="absolute left-4 top-1 text-6xl text-brand-yellow/30">“</span>
                <p className="line-clamp-4 max-w-[55ch] text-sm italic text-foreground/90">{review.text.slice(0, 200)}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red text-sm font-bold text-white">{review.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                  <div>
                    <p className="font-bold">{review.name}</p>
                    <div className="flex items-center gap-2"><RatingStars rating={review.rating} /><span className="text-xs text-emerald-600">✓ Verified</span></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {REVIEWS.slice(0, 8).map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`h-2 w-2 rounded-full ${i === active ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
