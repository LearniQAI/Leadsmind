"use client";

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { HeadingSettings } from './HeadingSettings';
import { replaceMergeTags } from '@/lib/builder/utils';

export interface HeadingProps {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
  fontSize?: number; // Optional override
}

export const Heading = ({ text, level, fontWeight, textAlign, color, fontSize, ...props }: HeadingProps & any) => {
  const { connectors: { connect, drag }, actions: { setProp } } = useNode();
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  const Tag = level;
  const displayText = enabled ? text : replaceMergeTags(text);
  
  // Base scales for sizes based on level if fontSize is not strictly provided
  const baseSizes = {
    h1: 'text-5xl md:text-6xl',
    h2: 'text-4xl md:text-5xl',
    h3: 'text-3xl md:text-4xl',
    h4: 'text-2xl md:text-3xl',
    h5: 'text-xl md:text-2xl',
    h6: 'text-lg md:text-xl',
  };

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
  };

  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  return (
    <div
      {...props}
      ref={(ref) => {
        if (ref) {
            connect(ref);
            drag(ref);
        }
      }}
      className={`w-full outline-dashed outline-1 outline-transparent hover:outline-blue-500/50 transition-all ${baseSizes[level as keyof typeof baseSizes]} ${weights[fontWeight as keyof typeof weights]} ${alignments[textAlign as keyof typeof alignments]} ${props.className || ''}`}
      style={{
        color,
        fontSize: fontSize ? `${fontSize}px` : undefined,
      }}
    >
      {enabled ? (
        <ContentEditable
            html={text}
            disabled={!enabled}
            onChange={(e) => setProp((props: any) => (props.text = e.target.value), 500)}
            tagName={Tag as any}
            className="outline-none w-full m-0 p-0 leading-tight tracking-tight"
        />
      ) : (
        <Tag className="outline-none w-full m-0 p-0 leading-tight tracking-tight" dangerouslySetInnerHTML={{ __html: displayText }} />
      )}
    </div>
  );
};

Heading.craft = {
  displayName: 'Heading',
  props: {
    text: 'Heading',
    level: 'h2',
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#111827',
  },
  related: {
    settings: HeadingSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
