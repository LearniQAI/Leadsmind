"use client";

import React from 'react';
import { useNode } from '@craftjs/core';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SectionSettings } from './SectionSettings';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SectionProps {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  backgroundColor: string;
  children?: React.ReactNode;
  canvas?: boolean;
}

export const Section = ({ 
    paddingTop, 
    paddingBottom, 
    paddingLeft, 
    paddingRight, 
    backgroundColor,
    children, 
    canvas, 
    ...props 
}: SectionProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <section
      {...props}
      ref={(ref) => {
        if (ref) {
            connect(ref);
            drag(ref);
        }
      }}
      className="w-full relative"
      style={{
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        backgroundColor,
      }}
    >
      {children}
    </section>
  );
};

Section.craft = {
  displayName: 'Section',
  isCanvas: true,
  props: {
    paddingTop: 64,
    paddingBottom: 64,
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: 'transparent',
  },
  related: {
    settings: SectionSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
};
