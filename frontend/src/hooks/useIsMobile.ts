import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

// Seuil aligné sur le breakpoint `md:` déjà utilisé partout ailleurs dans
// l'app (Tailwind) : en dessous, la mise en page mobile (onglets en bas)
// remplace la barre latérale desktop.
export function useIsMobile(): boolean {
const [isMobile, setIsMobile] = useState(
() => typeof window !== 'undefined' && window.matchMedia(MOBILE_BREAKPOINT).matches
);

useEffect(() => {
const mql = window.matchMedia(MOBILE_BREAKPOINT);
const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
mql.addEventListener('change', handler);
return () => mql.removeEventListener('change', handler);
}, []);

return isMobile;
}
