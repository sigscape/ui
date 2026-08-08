"use client";

import * as React from "react";

/**
 * SigLoader — the single canonical loading animation for the app: the
 * "Sigscape signature" spectrum loader, a row of coral-gradient bars whose
 * heights animate via pure CSS keyframes (see `.sig-loader` in globals.css).
 *
 * The bars are rendered declaratively (real `<div class="bar">` children with
 * their per-bar CSS variables), so they always paint on first commit. `stop()`
 * settles them into the static signature silhouette; `start()` resumes.
 * Reduced-motion is handled entirely by the CSS media query.
 *
 *   <SigLoader />                          // default app spinner (wave)
 *   <SigLoader bars={5} size="sm" />       // inline / button spinner
 *   const ref = useRef<SigLoaderHandle>(null); …; ref.current?.stop()
 */

export type SigLoaderStyle = "wave" | "signature" | "equalizer";
export type SigLoaderHandle = { stop: () => void; start: () => void };

type SigLoaderProps = {
  style?: SigLoaderStyle;
  speed?: number;
  bars?: number;
  minH?: number;
  size?: "sm";
  className?: string;
};

/* ── colour + silhouette (the gradient is computed here, never hardcoded elsewhere) ── */
function lerpHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const SOFT = "#f6a787";
const DEEP = "#d24e22";
const SIGNATURE = [0.18, 0.31, 0.56, 1.0, 0.62, 0.36, 0.58, 0.33, 0.2];

/** Per-bar style (gradient colour + CSS custom properties) for the N bars. */
function computeBars(n: number, minFrac: number, style: SigLoaderStyle, speed: number): React.CSSProperties[] {
  const dur = 1.15 / speed;
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const sil = SIGNATURE[Math.round(t * (SIGNATURE.length - 1))];
    // --rmin = the resting/min height as a fraction of --max, so the keyframes can
    // scaleY between --rmin and 1 (compositor) instead of animating height directly.
    const vars: Record<string, string> = { background: lerpHex(SOFT, DEEP, t), "--rest": `${(sil * 100).toFixed(1)}%` };
    if (style === "wave") {
      Object.assign(vars, { "--max": "100%", "--min": `${minFrac * 100}%`, "--rmin": minFrac.toFixed(3), "--dur": `${dur.toFixed(3)}s`, "--delay": `${(-(i * dur * 0.14)).toFixed(3)}s` });
    } else if (style === "signature") {
      Object.assign(vars, { "--max": `${(sil * 100).toFixed(1)}%`, "--min": `${(sil * 42).toFixed(1)}%`, "--rmin": "0.420", "--dur": `${(dur * 1.15).toFixed(3)}s`, "--delay": `${(-(i * dur * 0.09)).toFixed(3)}s` });
    } else {
      // equalizer — deterministic per-index variety (stable across SSR/hydration)
      const d = 0.7 + ((i * 0.37) % 1) * 0.6;
      const p = (i * 0.61) % 1;
      Object.assign(vars, { "--max": "100%", "--min": `${minFrac * 100}%`, "--rmin": minFrac.toFixed(3), "--dur": `${(dur * d).toFixed(3)}s`, "--delay": `${(-(p * dur * 2)).toFixed(3)}s` });
    }
    return vars as React.CSSProperties;
  });
}

export const SigLoader = React.forwardRef<SigLoaderHandle, SigLoaderProps>(function SigLoader(
  { style = "wave", speed = 1.3, bars = 9, minH = 0.16, size, className },
  ref,
) {
  const [settled, setSettled] = React.useState(false);
  React.useImperativeHandle(ref, () => ({ stop: () => setSettled(true), start: () => setSettled(false) }), []);

  const barStyles = computeBars(bars, minH, style, speed);
  const cls = ["sig-loader", size === "sm" && "sm", className].filter(Boolean).join(" ");
  return (
    <div className={cls} role="status" aria-label="Loading">
      {barStyles.map((s, i) => (
        <div key={i} className={settled ? "bar settled" : "bar"} style={s} />
      ))}
    </div>
  );
});

/**
 * Hold the `fallback` (a SigLoader by default) for `delayMs` before mounting
 * heavy `children`, so the loader actually paints and *animates* before a
 * synchronous, blocking mount. Use it to give visible feedback on freezes — e.g.
 * opening a large record in a function. Changing `token` re-shows the fallback.
 */
export function DeferredMount({ token, fallback, delayMs = 450, children }: { token: string; fallback?: React.ReactNode; delayMs?: number; children: React.ReactNode }) {
  const [readyToken, setReadyToken] = React.useState<string | null>(null);
  React.useEffect(() => {
    const t = setTimeout(() => setReadyToken(token), delayMs);
    return () => clearTimeout(t);
  }, [token, delayMs]);

  if (readyToken !== token) {
    return (
      <>
        {fallback ?? (
          <div className="flex flex-1 items-center justify-center py-16">
            <SigLoader />
          </div>
        )}
      </>
    );
  }
  return <>{children}</>;
}
