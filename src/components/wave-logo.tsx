import React from 'react';

interface WaveLogoProps {
  className?: string;
  size?: number;
}

export function WaveLogo({ className = '', size = 28 }: WaveLogoProps) {
  return (
    <img
      src="/wave-logo.png"
      alt="Wave"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
