"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils";
import { usePortalTarget } from "./Modal";

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * Shared hover/focus tooltip popover. Wrap any trigger; pass rich `content`
 * (a lead `<p>`, a `<ul>` of points, `<strong>` — all auto-styled). Portaled
 * (never clipped, works in the maximized studio) with a hover-bridge so you can
 * move into the panel to read/scroll. The building block behind `HelpTip`
 * (icon trigger) and `LabelTip` (label-text trigger).
 *
 * Positioning measures the trigger AND the panel, anchors directly below the
 * trigger, clamps to the viewport, and flips above when there's no room — so it
 * always lands next to its trigger, never adrift.
 */
export function Tooltip({ content, children, className }: { content: React.ReactNode; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const tipRef = React.useRef<HTMLDivElement>(null);
  const showTimer = React.useRef<number | undefined>(undefined);
  const target = usePortalTarget();

  const clearTimers = () => window.clearTimeout(showTimer.current);
  // Small open-delay so merely passing the cursor across the trigger doesn't pop it.
  const openSoon = () => {
    clearTimers();
    showTimer.current = window.setTimeout(() => setOpen(true), 140);
  };
  const openNow = () => {
    clearTimers();
    setOpen(true);
  };
  const close = () => {
    clearTimers();
    setOpen(false);
  };
  React.useEffect(() => clearTimers, []);

  // Place the panel relative to the trigger once both are in the DOM, and keep
  // it anchored on scroll/resize. Hidden until placed (no flash at the wrong spot).
  const place = React.useCallback(() => {
    const t = triggerRef.current?.getBoundingClientRect();
    if (!t) return;
    const m = 8;
    const tip = tipRef.current;
    const tw = tip?.offsetWidth ?? 320;
    const th = tip?.offsetHeight ?? 0;
    // Anchor the panel's left edge to the trigger's left, clamped to the viewport.
    const left = Math.max(m, Math.min(t.left, window.innerWidth - tw - m));
    const below = t.bottom + 6;
    const top = th > 0 && below + th > window.innerHeight - m && t.top - 6 - th > m ? t.top - 6 - th : below;
    setCoords({ top: Math.round(top), left: Math.round(left) });
  }, []);

  useIsoLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    place();
    const on = () => place();
    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on, true);
      window.removeEventListener("resize", on);
    };
  }, [open, place]);

  return (
    <span ref={triggerRef} className={cn("inline-flex w-fit items-center", className)} onMouseEnter={openSoon} onMouseLeave={close} onFocus={openNow} onBlur={close}>
      {children}
      {open &&
        target &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={{ position: "fixed", top: coords?.top ?? 0, left: coords?.left ?? 0, visibility: coords ? "visible" : "hidden" }}
            className={cn(
              // Same popover vocabulary as the dropdown: border-defined in light,
              // shadow-lifted in dark. See TopBar for the reasoning.
              "pointer-events-none z-[120] block max-h-[60vh] w-max min-w-48 max-w-sm overflow-y-auto rounded-lg border border-input bg-popover p-3 text-xs font-normal normal-case leading-relaxed tracking-normal text-foreground dark:border-border dark:shadow-lg",
              "[&_p:first-child]:mt-0 [&_p]:mt-2",
              "[&_ul]:mt-1.5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-4 [&_li]:marker:text-foreground/40",
              "[&_strong]:font-semibold [&_strong]:text-foreground",
            )}
          >
            {content}
          </div>,
          target,
        )}
    </span>
  );
}
