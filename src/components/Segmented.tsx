"use client";

import * as React from "react";

/**
 * A compact segmented toggle: a hairline-bordered row of options where the
 * active one takes the accent tint (`bg-primary/10 text-primary`) and the rest
 * are quiet until hovered. The standard small either/or control across the app
 * (value-mode, label-mode, export options) — reuse it instead of hand-rolling a
 * row of buttons.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-0.5 rounded-md border border-border p-0.5 ${className ?? ""}`}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`cursor-pointer rounded px-2.5 py-1 text-xs font-medium transition-colors ${value === o.value ? "bg-primary/10 text-primary" : "text-foreground/60 hover:text-foreground"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
