"use client";

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { ParagraphSettings } from './ParagraphSettings';
import { replaceMergeTags } from '@/lib/builder/utils';

export interface ParagraphProps {
  text: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';
}

export const Paragraph = ({ text, fontSize, textAlign, color, lineHeight, ...props }: ParagraphProps & any) => {
  const { connectors: { connect, drag }, actions: { setProp } } = useNode();
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  const displayText = enabled ? text : replaceMergeTags(text);
  
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const lineHeights = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
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
      className={`w-full outline-dashed outline-1 outline-transparent hover:outline-blue-500/50 transition-all ${alignments[textAlign as keyof typeof alignments]} ${lineHeights[lineHeight as keyof typeof lineHeights]} ${props.className || ''}`}
      style={{
        color,
        fontSize: `${fontSize}px`,
      }}
    >
      {enabled ? (
        <ContentEditable
            html={text}
            disabled={!enabled}
            onChange={(e) => setProp((props: any) => (props.text = e.target.value), 500)}
            tagName="p"
            className="outline-none w-full m-0 p-0"
        />
      ) : (
        <span dangerouslySetInnerHTML={{ __html: displayText }} />
      )}
    </div>
  );
};

Paragraph.craft = {
  displayName: 'Paragraph',
  props: {
    text: 'Type your paragraph text here. This block supports rich text styling if applied externally, but is built for clean, scalable body copy. ',
    fontSize: 16,
    textAlign: 'left',
    color: '#4b5563',
    lineHeight: 'relaxed',
  },
  related: {
    settings: ParagraphSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
