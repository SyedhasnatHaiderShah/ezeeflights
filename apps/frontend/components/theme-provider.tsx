"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: any) {
  const { children: _, ...rest } = props
  return <NextThemesProvider {...rest}>{children}</NextThemesProvider>
}
