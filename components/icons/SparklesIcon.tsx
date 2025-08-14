import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18.4l1.9-5.8 5.8-1.9-5.8-1.9L12 3z" />
        <path d="M5 21v-2" />
        <path d="M19 21v-2" />
        <path d="M3 5h2" />
        <path d="M19 5h2" />
        <path d="M3 19h2" />
        <path d="M19 19h2" />
        <path d="M5 3v2" />
        <path d="M19 3v2" />
    </svg>
);