"use client";

import * as React from "react";
import { Maximize2, X, ChevronLeft, ChevronRight, Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HotelImage } from "@/lib/types/hotels";

interface PhotoGalleryProps {
  images: HotelImage[];
  className?: string;
}

export function PhotoGallery({ images, className }: PhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);

  const mainImages = images.slice(0, 5);

  return (
    <div
      className={cn(
        "grid grid-cols-4 grid-rows-2 gap-3 h-[450px] md:h-[550px] rounded-[2rem] overflow-hidden bg-muted/20",
        className,
      )}
    >
      {/* Main Large Image */}
      <div
        className="col-span-4 md:col-span-2 row-span-1 md:row-span-2 relative group cursor-pointer overflow-hidden"
        onClick={() => setSelectedImage(0)}
      >
        <img
          src={mainImages[0]?.url}
          alt={mainImages[0]?.caption}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-xl p-4 rounded-full opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 border border-white/30">
            <Maximize2 className="text-white w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid Images (Hidden on mobile or adjusted) */}
      {mainImages.slice(1).map((img, idx) => (
        <div
          key={idx}
          className="relative group cursor-pointer overflow-hidden hidden md:block"
          onClick={() => setSelectedImage(idx + 1)}
        >
          <img
            src={img.url}
            alt={img.caption}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-xl p-3 rounded-full opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 border border-white/30">
              <Maximize2 className="text-white w-4 h-4" />
            </div>
          </div>
          
          {idx === 3 && images.length > 5 && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center group-hover:bg-slate-900/40 transition-colors">
              <Grid2X2 className="w-6 h-6 text-white mb-2 opacity-80" />
              <span className="text-white text-xl font-bold">
                +{images.length - 5}
              </span>
              <span className="text-white/70 text-[9px] font-bold uppercase tracking-wider mt-1">
                View All Photos
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Fullscreen Lightbox Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 z-50 text-white/40 hover:text-white transition-all hover:rotate-90 duration-300"
          >
            <X className="w-10 h-10" />
          </button>

          <div className="relative w-full max-w-7xl aspect-[16/10] flex items-center justify-center">
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].caption}
              className="w-full h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-500"
            />

            <div className="absolute -bottom-16 left-0 right-0 flex flex-col items-center gap-4">
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-white tracking-tight">
                  {images[selectedImage].caption || "Property View"}
                </p>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                  {images[selectedImage].category || "Gallery"}
                </p>
              </div>
              
              <div className="flex gap-2.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      idx === selectedImage
                        ? "bg-brand-red w-8"
                        : "bg-white/20 hover:bg-white/40"
                    )}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((selectedImage - 1 + images.length) % images.length);
              }}
              className="absolute left-4 md:-left-20 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 hover:text-white transition-all border border-white/10 active:scale-90"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((selectedImage + 1) % images.length);
              }}
              className="absolute right-4 md:-right-20 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 hover:text-white transition-all border border-white/10 active:scale-90"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
