
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // next-themes applies the class to the <html> tag, which is the
  // recommended approach. No extra wrapper is needed.
  return (
      <NextThemesProvider {...props}>
          {children}
      </NextThemesProvider>
  )
}
