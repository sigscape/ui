"use client";

import * as React from "react";
import { useTheme } from "next-themes";

const LOGO_RATIO = 540 / 140;

/**
 * The sigscape wordmark — the umbrella brand, used by sigscape.org for its own
 * identity and by mutopia.sigscape.org to show it is part of the same family.
 *
 * Switched off the actual next-themes theme rather than the OS: the dark-text
 * mark in light mode, the light-text one in dark mode. Before mount it renders
 * the light-mode mark (the default theme) and corrects on the client.
 *
 * **Consuming apps must ship both files** at these public-root paths:
 * `/assets/sigscape-logo.svg` and `/assets/sigscape-logo-reversed.svg`.
 */
export function SigscapeWordmark({
  className = "",
  height = 28,
}: {
  className?: string;
  /** Height in px; width scales automatically. */
  height?: number;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const src = isDark
    ? "/assets/sigscape-logo-reversed.svg"
    : "/assets/sigscape-logo.svg";

  return (
    <span className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="sigscape"
        style={{ height, width: height * LOGO_RATIO }}
      />
    </span>
  );
}

/**
 * The standalone sigscape mark (spectrum bars) — legible on light and dark
 * surfaces alike. Use for compact brand spots such as the studio toolbar.
 * Expects `/assets/sigscape-mark.svg`.
 */
export function SigscapeMark({
  className = "",
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/sigscape-mark.svg"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
    />
  );
}
