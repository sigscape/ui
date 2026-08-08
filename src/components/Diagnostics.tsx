"use client";

import * as React from "react";
import { CircleAlert, TriangleAlert, Info } from "lucide-react";
import { cn } from "../utils";
import type { Diagnostic, DiagnosticLevel } from "../diagnostics";

/**
 * The one renderer for content-level {@link Diagnostic}s — the precise, plain
 * explanations shown when a file's type is right but its content can't drive the
 * requested function (e.g. H/W signature names that don't match). Used on the
 * capability card, inside the exposure editor, and in the dataset inspector, so
 * the studio speaks with one voice.
 *
 * Follows skills.md: neutral only (never red), no flat `muted` tokens. Levels are
 * distinguished by icon and weight, not colour — the same soft grey callout
 * vocabulary as {@link Callout} (`bg-muted-foreground/[0.08]`, full
 * `text-foreground` body). Name lists render as wrapped mono chips, truncated.
 */
const ICONS: Record<DiagnosticLevel, typeof CircleAlert> = {
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

const CHIP_LIMIT = 24;

export function Diagnostics({ items, className }: { items?: Diagnostic[]; className?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {items.map((d, i) => (
        <DiagnosticItem key={`${d.title}-${i}`} d={d} />
      ))}
    </div>
  );
}

function DiagnosticItem({ d }: { d: Diagnostic }) {
  const Icon = ICONS[d.level];
  return (
    <div className="flex items-start gap-2 rounded-md bg-muted-foreground/[0.08] px-3 py-2 text-xs leading-relaxed text-foreground">
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", d.level === "info" ? "text-foreground/40" : "text-foreground/60")} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{d.title}</p>
        <p className="mt-0.5">{d.detail}</p>
        {d.lists?.map((list) => (
          <div key={list.label} className="mt-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/60">{list.label}</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {list.items.slice(0, CHIP_LIMIT).map((it) => (
                <span key={it} className="rounded bg-muted-foreground/12 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                  {it}
                </span>
              ))}
              {list.items.length > CHIP_LIMIT && (
                <span className="px-1 py-0.5 text-[10px] text-foreground/60">+{list.items.length - CHIP_LIMIT} more</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
