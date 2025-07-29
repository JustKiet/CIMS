"use client"

import React from 'react'
import Image from 'next/image'

export const LoginBackground: React.FC = () => {
  return (
    <div 
      className="relative w-full h-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/awc-login-bg.jpg)'
      }}
    >
      {/* Overlay for better contrast if needed */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Centered logo container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <Image
            src="/awc-logo.png"
            alt="AWC - Asia White Collar"
            width={280}
            height={120}
            priority
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}
