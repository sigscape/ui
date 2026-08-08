"use client";

import * as React from "react";
import { BadgeHelp } from "lucide-react";
import { Tooltip } from "./Tooltip";

/**
 * A small help (?) affordance: a question-mark icon that reveals a richer
 * explanation on hover/focus. Use it next to a heading or label instead of
 * spelling the description out inline — keep the UI terse, detail one hover away.
 *
 * `children` may be rich content — a lead `<p>`, a `<ul>` of points, `<strong>`.
 * For a label that should itself explain what it shows, use `LabelTip` instead.
 *
 * @example
 * <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
 *   Cluster subtraction
 *   <HelpTip><p className="font-medium text-foreground">Find what differs.</p></HelpTip>
 * </h3>
 */
export function HelpTip({ children, label = "More information", className }: { children: React.ReactNode; label?: string; className?: string }) {
  return (
    <Tooltip content={children} className={className}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex shrink-0 cursor-help items-center justify-center rounded-full p-0.5 text-foreground/40 transition-colors hover:bg-muted-foreground/12 hover:text-foreground focus-visible:bg-muted-foreground/12 focus-visible:text-foreground focus-visible:outline-none"
      >
        <BadgeHelp className="size-3.5" />
      </button>
    </Tooltip>
  );
}
