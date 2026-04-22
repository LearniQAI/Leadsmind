'use client';

import React, { useEffect } from 'react';

interface BrandingProviderProps {
  primaryColor?: string | null;
  platformName?: string | null;
  children: React.ReactNode;
}

export function BrandingProvider({ primaryColor, platformName, children }: BrandingProviderProps) {
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor);
      
      const hex = primaryColor.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
      }
    }

    if (platformName) {
      // Update page title if platform name exists
      const currentTitle = document.title;
      if (currentTitle.includes('Leadsmind')) {
        document.title = currentTitle.replace('Leadsmind', platformName);
      }
    }
  }, [primaryColor, platformName]);

  return <>{children}</>;
}
