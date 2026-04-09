'use client'

import React from 'react'

export function BackgroundEffects() {
  return (
    <>
      {/* Noise grain overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Mesh background orbs */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="orb orb-1 w-[700px] h-[700px] -top-[200px] -left-[150px] bg-[radial-gradient(circle,rgba(108,71,255,0.25)_0%,transparent_70%)] animate-drift" style={{ animationDuration: '20s' }} />
        <div className="orb orb-2 w-[500px] h-[500px] top-[10%] -right-[100px] bg-[radial-gradient(circle,rgba(253,171,61,0.18)_0%,transparent_70%)] animate-drift" style={{ animationDuration: '15s', animationDelay: '-5s' }} />
        <div className="orb orb-3 w-[600px] h-[600px] bottom-[20%] left-[20%] bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] animate-drift" style={{ animationDuration: '25s', animationDelay: '-10s' }} />
      </div>
    </>
  )
}
