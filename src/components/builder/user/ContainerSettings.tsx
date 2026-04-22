"use client";

import React from 'react';
import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '../ColorPicker';

export const ContainerSettings = () => {
    const { actions: { setProp }, layoutType, maxWidth, backgroundColor, padding } = useNode((node) => ({
        layoutType: node.data.props.layoutType,
        maxWidth: node.data.props.maxWidth,
        backgroundColor: node.data.props.backgroundColor,
        padding: node.data.props.padding,
    }));

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block">Container Type</Label>
                <div className="grid grid-cols-2 bg-muted p-1 rounded-md border border-white/5">
                    {['fixed', 'fluid'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setProp((props: any) => props.layoutType = type)}
                            className={`text-[10px] py-1.5 rounded capitalize font-bold ${layoutType === type ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-white'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {layoutType === 'fixed' && (
                <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block">Max Width</Label>
                    <Input 
                        value={maxWidth}
                        onChange={(e) => setProp((props: any) => props.maxWidth = e.target.value)}
                        className="h-9 text-xs bg-white/5 border-white/10"
                        placeholder="e.g. 1200px or 90%"
                    />
                </div>
            )}

            <ColorPicker 
                label="Background Color"
                value={backgroundColor === 'transparent' ? '' : backgroundColor}
                onChange={(val) => setProp((props: any) => props.backgroundColor = val)}
            />

            <div className="space-y-2 pt-2 border-t border-white/5">
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block">Internal Padding ({padding}px)</Label>
                <input 
                    type="range" min="0" max="128" step="4"
                    value={padding || 0}
                    onChange={(e) => setProp((props: any) => props.padding = Number(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>
        </div>
    );
};
