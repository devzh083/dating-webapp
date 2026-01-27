import React from "react";

export const MenuFooterImage = () => {
  return (
    <svg
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full bg-slate-50"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* 1. Background Gradient (Clean Slate to White) */}
      <defs>
        <linearGradient id="clean-fade" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stopColor="#f0fdfa" /> {/* Teal-50 */}
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        {/* Glow to make text readable */}
        <radialGradient id="text-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 60) rotate(90) scale(50 150)">
          <stop stopColor="white" stopOpacity="0.9"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>
      
      <rect width="400" height="120" fill="url(#clean-fade)" />

      {/* 2. BACKGROUND DOODLES (Light & Scattered) */}
      {/* We use a Group with low opacity and thin stroke for that 'sketch' look */}
      <g stroke="#0d9488" strokeWidth="1" fill="none" opacity="0.08">
        
        {/* Row 1 Doodles */}
        <path transform="translate(20, 20) scale(0.8)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        <path transform="translate(80, 15) scale(0.8)" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        <path transform="translate(300, 20) scale(0.8)" d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" /> {/* Bookmark */}
        <path transform="translate(360, 15) scale(0.8)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />

        {/* Row 2 Doodles (Middle) */}
        <path transform="translate(-10, 60) scale(1.2)" d="M40 35 Q 60 15 80 35" strokeDasharray="4 2" /> {/* Connection line */}
        <circle cx="50" cy="70" r="15" /> {/* Bubble */}
        <path transform="translate(340, 60) scale(0.9)" d="M2 21h19a1 1 0 0 0 1-1v-5.35l-3.7-4.62a1 1 0 0 0-1.56 0L13 15l-6-7.5a1 1 0 0 0-1.56 0L2 12v8a1 1 0 0 0 1 1z" /> {/* Image icon */}

        {/* Row 3 Doodles (Bottom) */}
        <path transform="translate(30, 90) scale(0.8)" d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /> {/* Coffee */}
        <path transform="translate(350, 95) scale(0.8)" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        
        {/* The Hyderabad Bridge (Background Feature) */}
        <g transform="translate(140, 70) scale(1.5)" opacity="0.5">
           <path d="M0 20 L80 20" /> {/* Road */}
           <path d="M40 0 L40 20" strokeWidth="2" /> {/* Pylon */}
           <path d="M40 2 L10 20 M40 2 L20 20 M40 2 L30 20" /> {/* Cables Left */}
           <path d="M40 2 L70 20 M40 2 L60 20 M40 2 L50 20" /> {/* Cables Right */}
        </g>
      </g>

      {/* 3. Text Glow (To ensure readability over doodles) */}
      <rect x="50" y="30" width="300" height="60" fill="url(#text-glow)" opacity="0.8" />

      {/* 4. MAIN BRANDING */}
      <g transform="translate(200, 62)" textAnchor="middle">
        {/* Main Title */}
        <text 
          x="0" y="0" 
          fontFamily="'Inter', sans-serif" 
          fontWeight="900" 
          fontSize="26" 
          fill="#0f766e" // Teal-700
          letterSpacing="-0.5px"
        >
          #TheDatingApp
        </text>

        {/* Subtitle Group */}
        <g transform="translate(0, 22)">
            
            {/* Left: Made in India */}
            <g transform="translate(-65, 0)">
                <rect x="-8" y="-6" width="16" height="8" rx="1" fill="white" stroke="#e5e7eb" strokeWidth="0.5"/>
                <rect x="-8" y="-6" width="16" height="2.6" fill="#ff9933" /> {/* Saffron */}
                <rect x="-8" y="-0.7" width="16" height="2.6" fill="#138808" /> {/* Green */}
                <circle cx="0" cy="-2" r="1" fill="#000080" /> {/* Wheel */}
                
                <text x="12" y="0" fontFamily="sans-serif" fontSize="9" fontWeight="600" fill="#0d9488" textAnchor="start" alignmentBaseline="middle">
                    Made in India
                </text>
            </g>

            {/* Separator */}
            <circle cx="0" cy="-2" r="1.5" fill="#cbd5e1" />

            {/* Right: Crafted in Hyderabad */}
            <g transform="translate(10, 0)">
                <path d="M-4 -3 C-4 -6 -1 -6 0 -3 C 1 -6 4 -6 4 -3 C 4 1 0 4 0 4 C 0 4 -4 1 -4 -3" fill="#f43f5e" transform="translate(0, -1) scale(0.8)"/>
                <text x="8" y="0" fontFamily="sans-serif" fontSize="9" fontWeight="600" fill="#0d9488" textAnchor="start" alignmentBaseline="middle">
                    Crafted in Hyderabad
                </text>
            </g>
        </g>
      </g>
    </svg>
  );
};