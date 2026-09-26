// Stroke icons (lucide-style), carried over from the old builder.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = ({ size = 16, ...p }: P) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p,
});

export const PagesIcon = (p: P) => (<svg {...base(p)}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>);
export const WidgetsIcon = (p: P) => (<svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
export const DesktopIcon = (p: P) => (<svg {...base(p)}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>);
export const TabletIcon = (p: P) => (<svg {...base(p)}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M12 18h.01" /></svg>);
export const MobileIcon = (p: P) => (<svg {...base(p)}><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></svg>);
export const SunIcon = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>);
export const MoonIcon = (p: P) => (<svg {...base(p)}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>);
export const CloseIcon = (p: P) => (<svg {...base({ strokeWidth: 2.5, ...p })}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>);
export const SearchIcon = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>);
export const ChevronIcon = (p: P) => (<svg {...base(p)}><path d="m9 18 6-6-6-6" /></svg>);
