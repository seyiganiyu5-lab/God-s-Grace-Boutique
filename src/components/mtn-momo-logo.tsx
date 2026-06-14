import React from 'react';

interface MtnMomoLogoProps {
  className?: string;
  size?: number;
}

export function MtnMomoLogo({ className = '', size = 28 }: MtnMomoLogoProps) {
  return (
    <img
      src="/mtn-momo-logo.png"
      alt="MTN MoMo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
