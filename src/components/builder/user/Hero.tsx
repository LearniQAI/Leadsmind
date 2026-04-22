"use client";

import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { Container } from './Container';
import { HeroSettings } from './HeroSettings';

export interface HeroProps {
  layout: 'split' | 'centered' | 'background';
  minHeight: number;
  backgroundColor: string;
  backgroundImage: string;
  overlayOpacity: number;
  padding: number;
  gap: number;
  // Pro Extras
  contentAlignment: 'start' | 'center' | 'end';
  contentMaxWidth: number;
  gradientOverlay: boolean;
  gradientColor1: string;
  gradientColor2: string;
  showScrollIndicator: boolean;
  useGlassmorphism: boolean;
  // Advanced Reqs
  backgroundVideo: string;
  heightPreset: 'full' | 'large' | 'compact';
  animation: 'none' | 'fade-in' | 'slide-up';
  showSecondaryButton: boolean;
}

export const Hero = ({
  layout,
  minHeight,
  backgroundColor,
  backgroundImage,
  overlayOpacity,
  padding,
  gap,
  contentAlignment,
  contentMaxWidth,
  gradientOverlay,
  gradientColor1,
  gradientColor2,
  showScrollIndicator,
  useGlassmorphism,
  backgroundVideo,
  heightPreset,
  animation,
  showSecondaryButton,
  ...props
}: HeroProps & any) => {
  const { connectors: { connect, drag } } = useNode();

  const layoutStyles = {
    split: "flex-col lg:flex-row items-center",
    centered: "flex-col items-center text-center",
    background: "flex-col items-center text-center",
  };

  const alignStyles = {
    start: "items-start pt-20",
    center: "items-center",
    end: "items-end pb-20",
  };

  const heightMap = {
      full: "min-h-screen",
      large: "min-h-[80vh]",
      compact: "min-h-[50vh]",
  };

  const animationClasses = {
      none: "",
      'fade-in': "animate-in fade-in duration-1000",
      'slide-up': "animate-in slide-in-from-bottom-12 duration-1000",
  };

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
          drag(ref);
        }
      }}
      className={`relative w-full flex overflow-hidden transition-all duration-500 ${heightMap[heightPreset as keyof typeof heightMap] || 'min-h-[80vh]'}`}
      style={{
        backgroundColor,
        backgroundImage: (layout === 'background' && !backgroundVideo) ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: `${padding}px 24px`
      }}
    >
        {backgroundVideo && (
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover z-0"
            >
                <source src={backgroundVideo} type="video/mp4" />
            </video>
        )}
      {/* Background Overlay (Solid or Gradient) */}
      {layout === 'background' && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            background: gradientOverlay 
              ? `linear-gradient(to bottom, ${gradientColor1}, ${gradientColor2})` 
              : `rgba(0,0,0,${overlayOpacity / 100})` 
          }}
        ></div>
      )}

      {/* Background Blobs (Premium Aesthetic) */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

      <div className={`relative z-10 max-w-7xl mx-auto w-full flex ${layoutStyles[layout as keyof typeof layoutStyles]} ${alignStyles[contentAlignment as keyof typeof alignStyles]} ${animationClasses[animation as keyof typeof animationClasses] || ''}`} style={{ gap: `${gap}px` }}>
        <div 
          className={`flex flex-col gap-6 ${layout === 'split' ? 'lg:w-1/2' : 'w-full'} ${useGlassmorphism ? 'backdrop-blur-xl bg-white/5 p-12 rounded-[48px] border border-white/10 shadow-2xl' : ''}`}
          style={{ maxWidth: layout === 'split' ? 'none' : `${contentMaxWidth}px` }}
        >
          <Element id="hero-content" is="div" canvas className="flex flex-col gap-6 items-inherit w-full">
            <div className="flex flex-col gap-6 items-inherit w-full">
               {/* Heading/Text drops here */}
            </div>
            <div className="flex gap-4 items-inherit">
                 <Element id="hero-cta-main" is="div" canvas className="flex items-inherit min-h-[40px] min-w-[100px]">
                    {/* Primary Button */}
                 </Element>
                 {showSecondaryButton && (
                    <Element id="hero-cta-secondary" is="div" canvas className="flex items-inherit min-h-[40px] min-w-[100px]">
                        {/* Secondary Button */}
                    </Element>
                 )}
            </div>
          </Element>
        </div>

        {layout === 'split' && (
          <div className="lg:w-1/2 flex justify-center">
            <Element id="hero-media" is="div" canvas className="w-full flex justify-center min-h-[200px]">
              <div className="w-full flex justify-center">
                <img
                  src={backgroundImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'}
                  className="w-full max-w-lg rounded-3xl shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700"
                  alt="Hero Media"
                />
              </div>
            </Element>
          </div>
        )}
      </div>

      {showScrollIndicator && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-50 animate-bounce cursor-pointer">
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scroll</span>
              <div className="w-[1px] h-12 bg-current"></div>
          </div>
      )}
    </div>
  );
};


Hero.craft = {
  displayName: 'Ultra Hero',
  props: {
    layout: 'split',
    minHeight: 80,
    backgroundColor: '#ffffff',
    backgroundImage: '',
    overlayOpacity: 40,
    padding: 80,
    gap: 40,
    contentAlignment: 'center',
    contentMaxWidth: 900,
    gradientOverlay: false,
    gradientColor1: 'rgba(0,0,0,0.8)',
    gradientColor2: 'rgba(108,71,255,0.4)',
    showScrollIndicator: true,
    useGlassmorphism: false,
    backgroundVideo: '',
    heightPreset: 'large',
    animation: 'fade-in',
    showSecondaryButton: false,
  },
  related: {
    settings: HeroSettings,
  },
};
