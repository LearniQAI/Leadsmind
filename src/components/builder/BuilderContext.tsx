"use client";

import React, { createContext, useContext, ReactNode } from 'react';

interface BuilderContextType {
    pages: { id: string; name: string; slug: string }[];
    websiteId: string | null;
    funnelId: string | null;
    websiteData: any;
    onUpdateWebsite: (updates: any) => void;
}


const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const BuilderProvider = ({ 
    children, 
    pages = [], 
    websiteId = null, 
    funnelId = null,
    websiteData = null,
    onUpdateWebsite = () => {}
}: { 
    children: ReactNode; 
    pages?: any[]; 
    websiteId?: string | null; 
    funnelId?: string | null;
    websiteData?: any;
    onUpdateWebsite?: (updates: any) => void;
}) => {
    return (
        <BuilderContext.Provider value={{ pages, websiteId, funnelId, websiteData, onUpdateWebsite }}>
            {children}
        </BuilderContext.Provider>
    );
};


export const useBuilder = () => {
    const context = useContext(BuilderContext);
    if (!context) {
        // Fallback or error
        return { 
            pages: [], 
            websiteId: null, 
            funnelId: null, 
            websiteData: null, 
            onUpdateWebsite: () => {} 
        };
    }
    return context;
};
