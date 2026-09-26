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
export const OutlineIcon = (p: P) => (<svg {...base(p)}><path d="M3 6h18" /><path d="M7 12h14" /><path d="M11 18h10" /><path d="M3 12h.01" /><path d="M7 18h.01" /></svg>);
export const UndoIcon = (p: P) => (<svg {...base(p)}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.69 3L3 13" /></svg>);
export const RedoIcon = (p: P) => (<svg {...base(p)}><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.69 3L21 13" /></svg>);
export const PaletteIcon = (p: P) => (<svg {...base(p)}><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="10.5" r="2.5" /><circle cx="8.5" cy="7.5" r="2.5" /><circle cx="6.5" cy="12.5" r="2.5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" /></svg>);
export const CloseIcon = (p: P) => (<svg {...base({ strokeWidth: 2.5, ...p })}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>);
export const SearchIcon = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>);
export const ChevronIcon = (p: P) => (<svg {...base(p)}><path d="m9 18 6-6-6-6" /></svg>);
export const SiteIcon = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>);
