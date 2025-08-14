import React from 'react';

export const CollapseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M11 13h4v4" />
        <path d="M3 21 11 13" />
        <path d="M13 11h-4v-4" />
        <path d="M21 3 13 11" />
    </svg>
);
