"use client";

import React from 'react';
import { useNode } from '@craftjs/core';
import { SpacerSettings } from './SpacerSettings';

export interface SpacerProps {
  height: number;
}

export const Spacer = ({ height, canvas, isCanvas, ...props }: SpacerProps & any) => {
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
      className={`w-full outline-dashed outline-1 outline-transparent hover:outline-blue-500/50 transition-all ${props.className || ''}`}
      style={{
        height: `${height}px`,
        minHeight: '10px'
      }}
    />
  );
};

Spacer.craft = {
  displayName: 'Spacer',
  isCanvas: false,
  props: {
    height: 32,
  },
  related: {
    settings: SpacerSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
};
