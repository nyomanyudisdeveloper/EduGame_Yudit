export const BeeSVG = () => (
  
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <ellipse cx="20" cy="50" rx="18" ry="32" transform="rotate(-45 20 50)" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2" />
        <ellipse cx="80" cy="50" rx="18" ry="32" transform="rotate(45 80 50)" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2" />
        <polygon points="45,85 55,85 50,95" fill="#27272a" />
        <g>
        <clipPath id="body-clip">
            <ellipse cx="50" cy="60" rx="26" ry="30" />
        </clipPath>
        <ellipse cx="50" cy="60" rx="26" ry="30" fill="#facc15" />
        <g clipPath="url(#body-clip)">
            <rect x="0" y="44" width="100" height="12" fill="#27272a" />
            <rect x="0" y="60" width="100" height="12" fill="#27272a" />
            <rect x="0" y="76" width="100" height="12" fill="#27272a" />
        </g>
        <ellipse cx="50" cy="60" rx="26" ry="30" fill="none" stroke="#27272a" strokeWidth="4" />
        </g>
        <path d="M 40 18 Q 28 0 18 12" fill="none" stroke="#27272a" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="18" cy="12" r="4" fill="#27272a" />
        <path d="M 60 18 Q 72 0 82 12" fill="none" stroke="#27272a" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="82" cy="12" r="4" fill="#27272a" />
        <circle cx="50" cy="30" r="18" fill="#facc15" stroke="#27272a" strokeWidth="4" />
        <ellipse cx="42" cy="27" rx="5.5" ry="7.5" fill="#ffffff" stroke="#27272a" strokeWidth="2" />
        <circle cx="42" cy="25" r="2.5" fill="#27272a" />
        <ellipse cx="58" cy="27" rx="5.5" ry="7.5" fill="#ffffff" stroke="#27272a" strokeWidth="2" />
        <circle cx="58" cy="25" r="2.5" fill="#27272a" />
    </svg>
);