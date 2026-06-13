import React from 'react';

interface MtnMomoLogoProps {
  className?: string;
  size?: number;
}

export function MtnMomoLogo({ className = '', size = 28 }: MtnMomoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Yellow rounded background */}
      <rect width="512" height="512" rx="128" fill="#FFC300" />
      {/* MTN oval */}
      <ellipse cx="256" cy="230" rx="180" ry="100" fill="#003A70" />
      {/* M */}
      <text
        x="130"
        y="268"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="120"
        fill="white"
      >
        M
      </text>
      {/* T (yellow on blue) */}
      <text
        x="218"
        y="268"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="120"
        fill="#FFC300"
      >
        T
      </text>
      {/* N */}
      <text
        x="290"
        y="268"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="120"
        fill="white"
      >
        N
      </text>
      {/* MO MO text */}
      <text
        x="170"
        y="380"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="56"
        fill="#003A70"
        letterSpacing="6"
      >
        MO MO
      </text>
      {/* Dot between MO and MO */}
      <circle cx="256" cy="360" r="8" fill="#003A70" />
    </svg>
  );
}
