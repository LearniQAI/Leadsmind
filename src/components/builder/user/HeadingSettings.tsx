"use client";

import React from 'react';
import { useNode } from '@craftjs/core';
import { ColorPicker } from '../ColorPicker';
import { Label } from '@/components/ui/label';

export const HeadingSettings = () => {
    const { actions: { setProp }, level, fontWeight, textAlign, color, fontSize } = useNode((node) => ({
        level: node.data.props.level,
        fontWeight: node.data.props.fontWeight,
        textAlign: node.data.props.textAlign,
        color: node.data.props.color,
        fontSize: node.data.props.fontSize,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block">Heading Level</Label>
                <div className="grid grid-cols-3 bg-muted p-1 rounded-md border border-white/5">
                    {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((l) => (
                        <button
                            key={l}
                            onClick={() => setProp((props: any) => props.level = l)}
                            className={`text-[10px] py-1 rounded uppercase font-bold ${level === l ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-white'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block">Font Weight</Label>
                <div className="flex bg-muted p-1 rounded-md border border-white/5">
                    {['normal', 'medium', 'semibold', 'bold', 'black'].map((w) => (
                        <button
                            key={w}
                            onClick={() => setProp((props: any) => props.fontWeight = w)}
                            className={`flex-1 text-[9px] py-1.5 rounded capitalize ${fontWeight === w ? 'bg-primary text-white shadow font-bold' : 'text-muted-foreground hover:text-white'}`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <ColorPicker 
                    label="Text Color"
                    value={color || '#111827'}
                    onChange={(val) => setProp((props: any) => props.color = val)}
                />
                
                <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block">Size Custom Override (px)</Label>
                    <input 
                        type="number" 
                        placeholder="Auto"
                        value={fontSize || ''}
                        onChange={(e) => setProp((props: any) => props.fontSize = e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full h-8 bg-white/5 border border-white/10 rounded px-2 text-xs text-white"
                    />
                </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block mt-2">Text Align</Label>
                <div className="flex bg-muted p-1 rounded-md border border-white/5">
                    {['left', 'center', 'right', 'justify'].map((align) => (
                        <button
                            key={align}
                            onClick={() => setProp((props: any) => props.textAlign = align)}
                            className={`flex-1 text-[10px] py-1 rounded capitalize ${textAlign === align ? 'bg-primary text-white shadow font-bold' : 'text-muted-foreground hover:text-white'}`}
                        >
                            {align}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
