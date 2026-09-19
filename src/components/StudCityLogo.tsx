'use client';

import React, { useId } from 'react';

export interface StudCityLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'stacked' | 'horizontal' | 'auto' | 'icon-only';
  showText?: boolean;
  animated?: boolean;
  textColor?: 'dark' | 'white';
}

export const StudCityLogo: React.FC<StudCityLogoProps> = ({
  className = '',
  size = 'md',
  layout = 'auto',
  showText = true,
  animated = true,
  textColor = 'dark',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const gradId = `studCityGrad-${uniqueId}`;
  const shadowId = `studCityShadow-${uniqueId}`;

  // Dimensions based on size
  const iconSize = {
    xs: 26,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 60,
  }[size];

  const textSizeClasses = {
    xs: {
      single: 'text-sm font-black',
      stackedTitle: 'text-[12px] font-black leading-[1.05]',
      stackedSubtitle: 'text-[12px] font-black leading-[1.05]',
    },
    sm: {
      single: 'text-base font-black',
      stackedTitle: 'text-[14px] font-black leading-[1.05]',
      stackedSubtitle: 'text-[14px] font-black leading-[1.05]',
    },
    md: {
      single: 'text-lg sm:text-xl font-black',
      stackedTitle: 'text-[17px] sm:text-[18px] font-black leading-[1.05]',
      stackedSubtitle: 'text-[17px] sm:text-[18px] font-black leading-[1.05]',
    },
    lg: {
      single: 'text-2xl font-black',
      stackedTitle: 'text-[21px] sm:text-[23px] font-black leading-[1.05]',
      stackedSubtitle: 'text-[21px] sm:text-[23px] font-black leading-[1.05]',
    },
    xl: {
      single: 'text-3xl font-black',
      stackedTitle: 'text-[26px] sm:text-[29px] font-black leading-[1.05]',
      stackedSubtitle: 'text-[26px] sm:text-[29px] font-black leading-[1.05]',
    },
  }[size];

  const primaryTextColor = textColor === 'white' ? 'text-white' : 'text-slate-900';
  const brandBlueColor = textColor === 'white' ? 'text-sky-300' : 'text-blue-600';

  return (
    <div
      className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${
        animated ? 'group cursor-pointer' : ''
      } ${className}`}
    >
      {/* High Fidelity Logo Icon Squircle */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 transition-transform duration-300 ease-out ${
            animated ? 'group-hover:scale-105 group-hover:-translate-y-0.5 shadow-sm' : ''
          }`}
          style={{
            filter: 'drop-shadow(0 4px 10px rgba(37, 99, 235, 0.28))',
          }}
        >
          <defs>
            {/* Vibrant Multi-stop Gradient */}
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="35%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Subtle Inner Glow */}
            <linearGradient id={`${gradId}-inner`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Squircle App Icon Base */}
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            rx="25"
            fill={`url(#${gradId})`}
          />
          
          {/* Subtle Top Gloss Highlight */}
          <rect
            x="2"
            y="2"
            width="96"
            height="48"
            rx="25"
            fill={`url(#${gradId}-inner)`}
            className="pointer-events-none"
          />

          {/* --- MAP PANELS (WHITE 3D FOLDED MAP) --- */}
          {/* Left Wing */}
          <path
            d="M17 68 L32 46 L45 54 L45 72 L31 64 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Right Wing */}
          <path
            d="M55 72 L55 54 L68 46 L83 68 L69 75 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Connection Fold */}
          <path
            d="M45 72 L55 72"
            stroke="#FFFFFF"
            strokeWidth="4.8"
            strokeLinecap="round"
          />

          {/* --- CITY SKYLINE (WHITE BUILDINGS WITH BLUE WINDOWS) --- */}
          <g fill="#FFFFFF">
            {/* Left Building */}
            <rect x="54" y="61" width="6.5" height="15" rx="1.2" />
            {/* Center Tall Building */}
            <rect x="62" y="53" width="8" height="23" rx="1.2" />
            {/* Right Building */}
            <rect x="71.5" y="63" width="6.5" height="13" rx="1.2" />

            {/* Modern Windows on center skyscraper */}
            <rect x="64.2" y="56.5" width="1.5" height="1.8" rx="0.3" fill="#2563EB" />
            <rect x="67" y="56.5" width="1.5" height="1.8" rx="0.3" fill="#2563EB" />
            <rect x="64.2" y="60.5" width="1.5" height="1.8" rx="0.3" fill="#2563EB" />
            <rect x="67" y="60.5" width="1.5" height="1.8" rx="0.3" fill="#2563EB" />
            <rect x="64.2" y="64.5" width="1.5" height="1.8" rx="0.3" fill="#2563EB" />
            <rect x="67" y="64.5" width="1.5" height="1.8" rx="0.3" fill="#2563EB" />
          </g>

          {/* --- MAP PIN (TEARDROP LOCATION MARKER) --- */}
          {/* Pin Body */}
          <path
            d="M50 20 C39 20 30 29 30 40 C30 53.5 48 69.5 50 71 C52 69.5 70 53.5 70 40 C70 29 61 20 50 20 Z"
            fill="#FFFFFF"
          />
          {/* Pin Center Hole */}
          <circle cx="50" cy="39" r="6" fill="#2563EB" />
        </svg>
      </div>

      {/* --- WORDMARK TYPOGRAPHY --- */}
      {showText && layout !== 'icon-only' && (
        <>
          {layout === 'stacked' ? (
            <div className="flex flex-col justify-center tracking-tight select-none">
              <span className={`${textSizeClasses.stackedTitle} ${primaryTextColor}`}>
                Stud
              </span>
              <span className={`${textSizeClasses.stackedSubtitle} ${brandBlueColor}`}>
                City
              </span>
            </div>
          ) : layout === 'horizontal' ? (
            <span className={`${textSizeClasses.single} tracking-tight ${primaryTextColor}`}>
              Stud<span className={brandBlueColor}>City</span>
            </span>
          ) : (
            // Auto: stacked on medium/large desktop, or horizontal on smaller mobile layouts
            <div className="flex flex-col justify-center tracking-tight select-none">
              <span className={`${textSizeClasses.stackedTitle} ${primaryTextColor}`}>
                Stud
              </span>
              <span className={`${textSizeClasses.stackedSubtitle} ${brandBlueColor}`}>
                City
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
