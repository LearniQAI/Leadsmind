'use client';

import { useRouter } from 'next/navigation';
import { SocialPostComposer } from './SocialPostComposer';

interface SocialPostNewClientProps {
  connectedPlatforms: string[];
}

export function SocialPostNewClient({ connectedPlatforms }: SocialPostNewClientProps) {
  const router = useRouter();

  const handleClose = () => {
    router.push('/social');
  };

  const handlePostCreated = () => {
    router.push('/social');
  };

  return (
    <SocialPostComposer 
      connectedPlatforms={connectedPlatforms} 
      onClose={handleClose} 
      onPostCreated={handlePostCreated}
    />
  );
}
