"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

/**
 * One theme across sigscape.org and mutopia.sigscape.org.
 *
 * next-themes keeps the preference in `localStorage`, which is keyed by origin
 * — so a reader who picked dark on the studio arrived at the atlas in light and
 * had to pick again. The two are separate origins but share a registrable
 * domain, and a cookie scoped to `.sigscape.org` is visible to both. That is the
 * only client-side store with that reach.
 *
 * The cookie is the carrier, not the source of truth: `localStorage` still runs
 * the show inside a tab, and {@link themeScript} copies the cookie into it
 * before next-themes boots. So the flow is write-through on change, read-once on
 * load, and everything in between is ordinary next-themes.
 */
const STORAGE_KEY = "theme";
const COOKIE_KEY = "sigscape-theme";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Runs before first paint, ahead of next-themes' own inline script, and seeds
 * `localStorage` from the shared cookie. Doing it here rather than in an effect
 * is what keeps the handoff free of a flash of the wrong theme: by the time
 * next-themes reads storage, the other domain's choice is already in it.
 *
 * Consuming apps must render this in `<head>`:
 *
 *   <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
 *
 * It is a string, not a component, because Next only guarantees ordering ahead
 * of hydration for raw inline script tags in the document head.
 */
export const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)${COOKIE_KEY}=([^;]*)/);if(!m)return;var v=decodeURIComponent(m[1]);if(v!=='light'&&v!=='dark'&&v!=='system')return;localStorage.setItem('${STORAGE_KEY}',v);}catch(e){}})();`;

/** Mirrors every theme change back out to the shared cookie. */
function ThemeCookieBridge() {
  const { theme } = useTheme();

  React.useEffect(() => {
    if (!theme) return;
    // Scope to the registrable domain so the sibling subdomain can read it. On
    // localhost and on Vercel preview URLs there is no shared parent to speak
    // of, so the cookie stays host-only and the sync is simply a no-op there.
    const host = window.location.hostname;
    const shared =
      host === "sigscape.org" || host.endsWith(".sigscape.org")
        ? "; domain=.sigscape.org"
        : "";
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(theme)}; path=/; max-age=${ONE_YEAR}; samesite=lax${shared}${secure}`;
  }, [theme]);

  return null;
}

/**
 * The theme provider for both sites.
 *
 * The configuration lives here rather than at each call site on purpose: it was
 * spelled out identically in two `app/layout.tsx` files, which is a coin-flip
 * away from the two domains disagreeing about what "default" means. Callers
 * pass children and nothing else; the props remain overridable only for the
 * rare case that has to differ, and nothing in either app uses that today.
 */
export function ThemeProvider({
  children,
  ...props
}: Partial<React.ComponentProps<typeof NextThemesProvider>> & {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey={STORAGE_KEY}
      {...props}
    >
      <ThemeCookieBridge />
      {children}
    </NextThemesProvider>
  );
}
