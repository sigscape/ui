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
    // `micro-label` carries the weight, casing, tracking and /60 in one place;
    // only the size varies, and it comes from the shared scale.
    <Tooltip content={help} className={cn("micro-label", size === "xs" ? "text-micro" : "text-micro-plus", className)}>
      <span tabIndex={0} className="cursor-help transition-colors hover:text-foreground/80 focus-visible:text-foreground/80 focus-visible:outline-none">
        {children}
      </span>
    </Tooltip>
  );
}
