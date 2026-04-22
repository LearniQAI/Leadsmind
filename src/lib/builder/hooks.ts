"use client";

import { useEffect, useRef } from 'react';
import { useBuilder } from '@/components/builder/BuilderContext';

/**
 * Automatically syncs component props to the website's global config
 * if the component is marked as global.
 */
export function useGlobalSync(isGlobal: boolean, globalId: string, props: any) {
    const { websiteData, onUpdateWebsite } = useBuilder();
    const firstRender = useRef(true);

    useEffect(() => {
        // Skip first render to avoid redundant saves and allow loading from DB
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (isGlobal && globalId && websiteData) {
            onUpdateWebsite({
                config: {
                    ...websiteData.config,
                    globals: {
                        ...websiteData.config?.globals,
                        [globalId]: props
                    }
                }
            });
        }
    }, [JSON.stringify(props), isGlobal, globalId]);
}
