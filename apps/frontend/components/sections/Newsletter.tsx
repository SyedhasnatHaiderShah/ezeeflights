"use client"

import * as React from "react"
import { Mail } from "lucide-react"

export function Newsletter() {
  return (
    <section className="w-full bg-muted dark:bg-card border-y border-border py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display">Stay Updated</h2>
          <p className="text-xs text-muted-foreground font-medium tracking-wide">Subscribe for exclusive flight deals and travel insights</p>
        </div>

        <form
          className="flex flex-col sm:flex-row w-full max-w-lg mx-auto shadow-xl rounded-xl overflow-hidden border border-border"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Input Area */}
          <div className="flex-grow relative h-12 md:h-14">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="email"
              placeholder="Enter Your Email"
              required
              className="w-full h-full pl-12 pr-4 bg-background text-foreground placeholder:text-muted-foreground font-medium text-sm outline-none focus:bg-muted/50 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="h-12 md:h-14 px-8 bg-brand-red hover:bg-brand-red-dark text-white text-sm font-bold font-display tracking-wide transition-all duration-300 flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}
