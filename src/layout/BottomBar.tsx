"use client";

import * as React from "react";
import Link from "next/link";

export type FooterLink = { label: string; href: string; external?: boolean };
export type FooterSection = {
  title: string;
  links: readonly FooterLink[];
};

/**
 * The shared footer. Like the top bar, it takes already-resolved data: the app
 * translates labels and filters by role before handing them over.
 *
 * `compact` drops everything but the copyright line — mutopia uses it on the
 * login page, where the full footer would be noise.
 */
export function BottomBar({
  logo,
  homeHref = "/",
  tagline,
  sections = [],
  copyright,
  actions,
  compact = false,
}: {
  logo: React.ReactNode;
  homeHref?: string;
  /** One line under the wordmark. Omit to show the wordmark alone. */
  tagline?: string;
  sections?: readonly FooterSection[];
  copyright: string;
  /** Right-hand column (e.g. a theme toggle). */
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {!compact && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            <div className="col-span-2 lg:col-span-1">
              <Link
                href={homeHref}
                className="inline-block text-foreground"
              >
                {logo}
              </Link>
              {tagline && (
                <p className="mt-4 max-w-xs text-sm text-foreground">
                  {tagline}
                </p>
              )}
            </div>

            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-foreground">
                  {section.title}
                </h3>
                <ul className="mt-3 space-y-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="-mx-2 inline-block rounded-md px-2 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted-foreground/12"
                      >
                        {link.label}
                        {/* A link that leaves the site says so, derived from
                            the flag that already decides target="_blank" — so
                            the mark cannot disagree with where the link goes.
                            Both consumers used to write this by hand, one into
                            its i18n strings and one in its wrapper, which is
                            two implementations of one rule waiting to drift.
                            Non-breaking space so the arrow never wraps alone;
                            aria-hidden because "right arrow" read out after
                            every external link is noise, and the new tab is
                            already announced. */}
                        {link.external && <span aria-hidden>{"\u00a0→"}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {actions && (
              <div className="flex items-start justify-center sm:justify-end lg:col-start-4">
                {actions}
              </div>
            )}
          </div>
        )}

        <div
          className={
            compact
              ? "flex flex-col items-center justify-center gap-4 md:flex-row"
              : "mt-12 border-t border-border pt-6"
          }
        >
          <p className="text-sm text-foreground">{copyright}</p>
          {compact && actions}
        </div>
      </div>
    </footer>
  );
}
