"use client";

import React, { createContext, useContext, ReactNode } from 'react';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

interface BuilderContextType {
    pages: { id: string; name: string; slug: string }[];
    websiteId: string | null;
    funnelId: string | null;
    websiteData: any;
    onUpdateWebsite: (updates: any) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
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
    const [viewMode, setViewMode] = React.useState<ViewMode>('desktop');

    return (
        <BuilderContext.Provider value={{ 
            pages, 
            websiteId, 
            funnelId, 
            websiteData, 
            onUpdateWebsite,
            viewMode,
            setViewMode
        }}>
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
            onUpdateWebsite: () => {},
            viewMode: 'desktop' as ViewMode,
            setViewMode: () => {}
        };
    }
    return context;
};
