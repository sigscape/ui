"use client";

import * as React from "react";
import { cn } from "../utils";
import { Tooltip } from "./Tooltip";

/**
 * A field micro-label with an attached explanation. Renders the canonical label
 * style (tiny, uppercase, semibold, `text-foreground/60`) as a dotted-underline
 * hover/focus trigger that reveals a detailed description of what the field shows
 * — so a terse label can still explain itself. Use it in place of a plain label
 * `<span>` wherever the field's meaning isn't obvious.
 *
 * `help` may be rich content (a lead `<p>`, a `<ul>` of points, `<strong>`).
 *
 * @example
 * <LabelTip help={<><p className="font-medium text-foreground">Samples for this signature.</p><ul><li>…</li></ul></>}>Samples</LabelTip>
 */
export function LabelTip({ children, help, size = "sm", className }: { children: React.ReactNode; help: React.ReactNode; size?: "xs" | "sm"; className?: string }) {
  return (
    <Tooltip content={help} className={cn("font-semibold uppercase tracking-wide text-foreground/60", size === "xs" ? "text-[10px]" : "text-[11px]", className)}>
      <span tabIndex={0} className="cursor-help transition-colors hover:text-foreground/80 focus-visible:text-foreground/80 focus-visible:outline-none">
        {children}
      </span>
    </Tooltip>
  );
}
