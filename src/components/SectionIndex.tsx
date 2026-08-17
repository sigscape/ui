"use client";

import * as React from "react";
import { cn } from "../utils";

export type SectionIndexItem = {
  /** Anchor id of the section this entry points at. */
  id: string;
  /** Short label shown in the index. */
  label: string;
};

/**
 * The sticky "on this page" index.
 *
 * A left rule with the active entry marked by an accent border and a tinted
 * row, which is the treatment sigscape.org's package pages settled on. It lives
 * here because the atlas needs the same thing: it had grown its own version — a
 * bordered card with dots on a progress track — and two indexes that do the same
 * job in two visual languages is exactly the drift `@sigscape/ui` exists to
 * prevent.
 *
 * Presentational on purpose. `activeId` is passed in rather than discovered,
 * because the two apps decide "which section am I in" differently: one observes
 * intersections, the other tracks scroll against its own layout. {@link
 * useActiveSection} is here for callers that want the common answer.
 *
 * Entries are anchors by default, which is right for a static page and keeps
 * the hash shareable. Pass `onSelect` when the host needs to intercept the jump
 * — the atlas scrolls with an offset for its sticky chrome — and the entries
 * become buttons instead.
 */
export function SectionIndex({
  sections,
  activeId,
  onSelect,
  onActivate,
  title = "On this page",
  className,
}: {
  sections: readonly SectionIndexItem[];
  /** Which entry reads as current. */
  activeId?: string;
  /** Intercept the jump; entries render as buttons when this is given. */
  onSelect?: (id: string) => void;
  /** Fired whenever an entry is chosen, whichever element type is in use. */
  onActivate?: (id: string) => void;
  /** Heading above the list. Pass `null` to omit it. */
  title?: React.ReactNode;
  className?: string;
}) {
  if (sections.length === 0) return null;

  return (
    <nav aria-label={typeof title === "string" ? title : "Page sections"} className={className}>
      {title !== null && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
          {title}
        </p>
      )}
      {/* The rule is drawn by the entries themselves, not by this list.
          Hanging it here meant each entry needed `-ml-px` to sit its own border
          on top of it, and that 1px lives outside the list's box — any ancestor
          that clips horizontally erases it. The atlas mounts this index in a
          scroll container, so the active entry's accent was painted and then
          cut off, which is why the two sites looked different. Stacked entries
          with no gap make a continuous rule with nothing hanging outside. */}
      <ul>
        {sections.map((s) => {
          const active = activeId === s.id;
          const shared = cn(
            "block w-full border-l py-1.5 pl-4 text-left text-sm transition-colors",
            active
              ? // The accent, in both themes: `--primary` carries a value per
                // theme, so this is one rule rather than a light and a dark
                // variant that can drift apart.
                "rounded-r-md border-primary bg-primary/8 font-medium text-foreground"
              : "border-border text-foreground/55 hover:border-foreground/30 hover:text-foreground",
          );
          return (
            <li key={s.id}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => {
                    onActivate?.(s.id);
                    onSelect(s.id);
                  }}
                  aria-current={active ? "location" : undefined}
                  className={cn(shared, "cursor-pointer")}
                >
                  {s.label}
                </button>
              ) : (
                <a
                  href={`#${s.id}`}
                  onClick={() => onActivate?.(s.id)}
                  aria-current={active ? "location" : undefined}
                  className={shared}
                >
                  {s.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Which of `ids` is currently in view, for driving {@link SectionIndex}.
 *
 * The margins bias the trigger band to the upper third of the viewport, so the
 * index advances when a heading reaches reading position rather than when it
 * first appears at the bottom edge.
 */
export function useActiveSection(
  ids: readonly string[],
  { rootMargin = "-20% 0px -70% 0px" }: { rootMargin?: string } = {},
): { activeId: string | undefined; select: (id: string) => void } {
  const [activeId, setActiveId] = React.useState<string | undefined>(ids[0]);
  // A click is a statement of intent, and near the foot of a page it is the
  // only reliable one. The last sections often cannot be scrolled any further
  // — they are already fully on screen, so there is nothing left to scroll —
  // and an index driven purely by scroll position then refuses to acknowledge
  // the click at all. Pinning the reader's choice until they scroll again is
  // what makes those entries work, without padding the document to manufacture
  // scroll room that the content does not need.
  const pinnedUntil = React.useRef(0);
  // Compare by value: callers build this array inline, so a reference check
  // would re-run the observer on every render.
  const key = ids.join("\n");

  React.useEffect(() => {
    const list = key ? key.split("\n") : [];
    if (list.length === 0) return;
    // At the end of the document the observer stops being able to answer. The
    // final sections cannot be scrolled up into the trigger band — there is no
    // page left below them — so the band keeps reporting whichever tall section
    // straddles it, however far you scroll. Measured on a package page at
    // 2560x1440: clicking the last entry scrolled to the bottom and the index
    // still read "Installation", two entries above.
    //
    // Past that point geometry answers instead: the last section whose top has
    // crossed the trigger line.
    const atEnd = () =>
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;

    // Reaching the end of the document means you are at the last section —
    // there is nothing below it to be at. Trying to be cleverer than that (the
    // last section whose top had crossed the trigger line) still answered
    // "Installation" at 2560x1440, because the final section's top never
    // reaches the line on a page shorter than the viewport allows.
    const settleAtEnd = () => setActiveId(list[list.length - 1]);
    const pinned = () => Date.now() < pinnedUntil.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (pinned()) return;
        if (atEnd()) return settleAtEnd();
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin },
    );
    for (const id of list) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    // The observer fires only on threshold crossings, and the last stretch of
    // scrolling crosses none of them.
    const onScroll = () => {
      if (pinned() || !atEnd()) return;
      settleAtEnd();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [key, rootMargin]);

  // The window covers a smooth scroll finishing; after it, the observer is
  // authoritative again and ordinary scrolling moves the highlight as usual.
  const select = React.useCallback((id: string) => {
    pinnedUntil.current = Date.now() + 900;
    setActiveId(id);
  }, []);

  return { activeId, select };
}
