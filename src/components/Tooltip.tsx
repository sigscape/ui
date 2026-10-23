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
 * move into the panel to read, scroll, or click something in it. The building
 * block behind `HelpTip` (icon trigger) and `LabelTip` (label-text trigger).
 *
 * Positioning measures the trigger AND the panel, anchors directly below the
 * trigger, clamps to the viewport, and flips above when there's no room — so it
 * always lands next to its trigger, never adrift.
 *
 * Getting into the panel is made easy three ways. The gap between trigger and
 * panel is part of the panel's hover surface (padding on the trigger's side,
 * not empty space), so the pointer never crosses dead ground. Leaving the
 * trigger does not close at once: there is a short grace period, long enough
 * to arrive even on a diagonal. And the portaled panel sits inside the
 * trigger's React subtree, so React treats pointer and focus inside it as
 * inside the trigger; the panel stays while a button in it is clicked.
 */
export function Tooltip({ content, children, className }: { content: React.ReactNode; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = React.useState(false);
  // `top` when the panel hangs below the trigger, `bottom` when it flips above.
  const [coords, setCoords] = React.useState<{ left: number; top?: number; bottom?: number } | null>(null);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const tipRef = React.useRef<HTMLDivElement>(null);
  const showTimer = React.useRef<number | undefined>(undefined);
  const hideTimer = React.useRef<number | undefined>(undefined);
  const target = usePortalTarget();

  const clearTimers = () => {
    window.clearTimeout(showTimer.current);
    window.clearTimeout(hideTimer.current);
  };
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
  // Grace period on the way out: long enough to reach the panel, short enough
  // that the tooltip does not linger once the pointer has moved on.
  const closeSoon = () => {
    clearTimers();
    hideTimer.current = window.setTimeout(() => setOpen(false), 180);
  };
  React.useEffect(() => clearTimers, []);

  const onEnter = () => {
    if (open) clearTimers();
    else openSoon();
  };
  // Focus moving between the trigger and the panel (clicking a button in the
  // panel) is not leaving; only focus landing elsewhere closes.
  const onBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && (triggerRef.current?.contains(next) || tipRef.current?.contains(next))) return;
    close();
  };

  // Place the panel relative to the trigger once both are in the DOM, and keep
  // it anchored on scroll/resize. Hidden until placed (no flash at the wrong spot).
  const place = React.useCallback(() => {
    const t = triggerRef.current?.getBoundingClientRect();
    if (!t) return;
    const m = 8;
    const tip = tipRef.current;
    const tw = tip?.offsetWidth ?? 320;
    // The measured height includes the bridge padding, so the fit test is honest.
    const th = tip?.offsetHeight ?? 0;
    // Anchor the panel's left edge to the trigger's left, clamped to the viewport.
    const left = Math.round(Math.max(m, Math.min(t.left, window.innerWidth - tw - m)));
    const flip = th > 0 && t.bottom + th > window.innerHeight - m && t.top - th > m;
    setCoords(flip ? { left, bottom: Math.round(window.innerHeight - t.top) } : { left, top: Math.round(t.bottom) });
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

  const above = coords?.bottom !== undefined;

  return (
    <span ref={triggerRef} className={cn("inline-flex w-fit items-center", className)} onMouseEnter={onEnter} onMouseLeave={closeSoon} onFocus={openNow} onBlur={onBlur}>
      {children}
      {open &&
        target &&
        createPortal(
          // The outer box is the hover surface: the panel plus the gap toward
          // the trigger, so there is no dead strip to fall through on the way in.
          <div
            ref={tipRef}
            role="tooltip"
            style={{ position: "fixed", left: coords?.left ?? 0, top: coords?.top, bottom: coords?.bottom, visibility: coords ? "visible" : "hidden" }}
            className={cn("z-[120] w-max", above ? "pb-1.5" : "pt-1.5")}
          >
            <div
              className={cn(
                // Same popover vocabulary as the dropdown: border-defined in light,
                // shadow-lifted in dark. See TopBar for the reasoning.
                "block max-h-[60vh] min-w-48 max-w-sm overflow-y-auto rounded-lg border border-border bg-popover p-3 text-xs font-normal normal-case leading-relaxed tracking-normal text-foreground dark:shadow-lg",
                "[&_p:first-child]:mt-0 [&_p]:mt-2",
                "[&_ul]:mt-1.5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-4 [&_li]:marker:text-foreground/40",
                "[&_strong]:font-semibold [&_strong]:text-foreground",
              )}
            >
              {content}
            </div>
          </div>,
          target,
        )}
    </span>
  );
}
