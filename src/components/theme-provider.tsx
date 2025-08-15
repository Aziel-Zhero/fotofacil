"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

function ThemeProviderWrapper({ children, ...props }: ThemeProviderProps) {
    const { theme } = useTheme();

    React.useEffect(() => {
        document.body.classList.remove('theme-blue', 'dark', 'light');
        if(theme) {
            document.body.classList.add(theme);
        }
    }, [theme]);
    
    return <>{children}</>;
}


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
      <NextThemesProvider {...props}>
        <ThemeProviderWrapper {...props}>
            {children}
        </ThemeProviderWrapper>
      </NextThemesProvider>
  )
}
