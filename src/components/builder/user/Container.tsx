"use client";

import React from 'react';
import { useNode } from '@craftjs/core';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ContainerSettings } from './ContainerSettings';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ContainerProps {
  layoutType: 'fluid' | 'fixed';
  maxWidth: string;
  backgroundColor: string;
  padding: number;
  children?: React.ReactNode;
}

export const Container = ({ 
    layoutType,
    maxWidth,
    backgroundColor,
    padding,
    children, 
    canvas, 
    isCanvas,
    ...props 
}: ContainerProps & any) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <div
      {...props}
      ref={(ref) => {
        if (ref) {
            connect(ref);
            drag(ref);
        }
      }}
      className={cn(
        "transition-all duration-200 outline-dashed outline-1 outline-transparent hover:outline-black/10",
        layoutType === 'fixed' ? "mx-auto" : "w-full",
        props.className
      )}
      style={{
        maxWidth: layoutType === 'fixed' ? maxWidth : '100%',
        backgroundColor,
        padding: `${padding}px`,
      }}
    >
      {children}
    </div>
  );
};

Container.craft = {
  displayName: 'Container',
  isCanvas: true,
  props: {
    layoutType: 'fixed',
    maxWidth: '1200px',
    backgroundColor: 'transparent',
    padding: 16,
  },
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
};
