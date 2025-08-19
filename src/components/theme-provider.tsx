
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
      <NextThemesProvider {...props}>
          <ThemeInjector />
          {children}
      </NextThemesProvider>
  )
}

// Helper component to dynamically add/remove the theme-blue class from the body
function ThemeInjector() {
    const { theme } = useTheme();

    React.useEffect(() => {
        const body = document.body;
        // Remove all theme classes first to avoid conflicts
        body.classList.remove('theme-blue');
        
        // Add the correct class based on the current theme
        if (theme === 'blue') {
            body.classList.add('theme-blue');
        }
        // The 'dark' class is handled by next-themes automatically
    }, [theme]);

    return null;
}
