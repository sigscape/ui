import * as React from "react";

const LOGO_RATIO = 540 / 140;

/**
 * The sigscape wordmark — the umbrella brand, used by sigscape.org for its own
 * identity and by mutopia.sigscape.org to show it is part of the same family.
 *
 * Switched by CSS, not JavaScript: both marks are emitted and the `dark:`
 * variant picks one. That works because `tokens.css` defines `@custom-variant
 * dark` against the next-themes `.dark` class, so `dark:` follows the site
 * theme rather than the OS setting. Reading the theme in JS instead would mean
 * a client component, no wordmark in the server-rendered HTML, and a flash of
 * the wrong mark on first paint.
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
  const size = { height, width: height * LOGO_RATIO };
  return (
    <span className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/sigscape-logo.svg"
        alt="sigscape"
        style={size}
        className="block dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/sigscape-logo-reversed.svg"
        alt=""
        aria-hidden
        style={size}
        className="hidden dark:block"
      />
    </span>
  );
}

/**
 * The standalone sigscape mark (spectrum bars) — legible on light and dark
 * surfaces alike, so it needs no theme switch. Use for compact brand spots such
 * as the studio toolbar. Expects `/assets/sigscape-mark.svg`.
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
