import React from 'react';

interface WaveLogoProps {
  className?: string;
  size?: number;
}

export function WaveLogo({ className = '', size = 28 }: WaveLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="512" height="512" rx="128" fill="#1DC7EA" />
      <path
        d="M100 260c30-40 60-50 90-30s60 50 90 30 60-50 90-30 40 30 40 30"
        stroke="white"
        strokeWidth="36"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M100 320c30-40 60-50 90-30s60 50 90 30 60-50 90-30 40 30 40 30"
        stroke="white"
        strokeWidth="36"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M100 380c30-40 60-50 90-30s60 50 90 30 60-50 90-30 40 30 40 30"
        stroke="white"
        strokeWidth="36"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}
