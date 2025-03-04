'use client';

import { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type Theme = string;
type Attribute = 'class' | 'data-theme' | 'data-mode';

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: Attribute;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}