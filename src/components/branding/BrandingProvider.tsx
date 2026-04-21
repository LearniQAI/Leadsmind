'use client';

import React, { useEffect } from 'react';

interface BrandingProviderProps {
  primaryColor?: string | null;
  children: React.ReactNode;
}

export function BrandingProvider({ primaryColor, children }: BrandingProviderProps) {
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor);
      
      // Convert HEX to RGB for alpha channels
      const hex = primaryColor.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
      }
    } else {
      // Reset to default if no branding
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-rgb');
    }
  }, [primaryColor]);

  return <>{children}</>;
}
