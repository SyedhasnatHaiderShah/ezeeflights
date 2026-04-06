import * as React from "react"
import { X } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center py-8 px-4 sm:px-6 bg-[#f8f9fa] dark:bg-background overflow-hidden transition-colors duration-300">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white dark:bg-card/80 dark:backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-gray-100 dark:border-border overflow-hidden relative group">
          {/* Close Button Link back to Home */}
          <Link 
            href="/" 
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-20"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </Link>

          {/* Top Logo or Decorative bar if needed */}
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </div>

        {/* Footer info/links could go here if global */}
      </div>
    </div>
  )
}
