"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Tags } from "../components/Tag";
import { ThemeToggle } from "../theme/ThemeToggle";

/**
 * A dropdown entry. Everything here is already resolved by the app — labels are
 * translated and role filtering has been applied — so the shell stays free of
 * i18n and auth.
 */
export type NavChild = {
  label: string;
  href: string;
  description?: string;
  /** Chips beside the label, e.g. a package's language mark or "alpha". */
  tags?: readonly string[];
  external?: boolean;
};

export type NavItem =
  | { label: string; href: string; external?: boolean; children?: undefined }
  | { label: string; href?: undefined; children: readonly NavChild[] };

function isDropdown(
  item: NavItem,
): item is { label: string; children: readonly NavChild[] } {
  return Array.isArray(item.children);
}

const trigger =
  "inline-flex cursor-pointer items-center gap-1 rounded-md px-2 text-base font-medium text-foreground transition-colors hover:bg-muted-foreground/12";

function Dropdown({
  item,
  onNavigate,
}: {
  item: { label: string; children: readonly NavChild[] };
  onNavigate?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const closeTimer = React.useRef<number | undefined>(undefined);

  const openNow = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // A short close delay keeps a bridge between the trigger and the panel.
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  };

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  React.useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className={`${trigger} ${open ? "bg-muted-foreground/12" : "bg-transparent"}`}
      >
        {item.label}
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover p-2 shadow-lg">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              target={child.external ? "_blank" : undefined}
              rel={child.external ? "noopener noreferrer" : undefined}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted-foreground/12"
            >
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                {child.label}
                <Tags tags={child.tags} />
              </span>
              {child.description && (
                <span className="mt-0.5 block text-foreground">
                  {child.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileDropdown({
  item,
  onNavigate,
}: {
  item: { label: string; children: readonly NavChild[] };
  onNavigate: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between rounded-md py-3 text-base font-medium text-foreground transition-colors hover:bg-muted-foreground/12"
      >
        {item.label}
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-1 pb-3 pl-3">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              target={child.external ? "_blank" : undefined}
              rel={child.external ? "noopener noreferrer" : undefined}
              onClick={onNavigate}
              className="-mx-2 block rounded-md px-2 py-1.5 transition-colors hover:bg-muted-foreground/12"
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {child.label}
                <Tags tags={child.tags} />
              </span>
              {child.description && (
                <span className="block text-sm text-foreground">
                  {child.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The shared top bar for sigscape.org and mutopia.sigscape.org.
 *
 * Everything app-specific arrives as a prop: the wordmark, the already-resolved
 * nav, and whatever belongs on the right (mutopia passes its user menu). The
 * shell itself owns only geometry and the interaction vocabulary, so the two
 * domains cannot drift apart again.
 */
export function TopBar({
  logo,
  nav,
  homeHref = "/",
  actions,
  mobileActions,
}: {
  logo: React.ReactNode;
  nav: readonly NavItem[];
  homeHref?: string;
  /** Right-hand slot beside the theme toggle (e.g. a user menu). */
  actions?: React.ReactNode;
  /** Extra content at the foot of the open mobile menu. */
  mobileActions?: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith("http") || href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Three columns, not `justify-between`: the side columns are equal, so
          the nav sits in the middle one and is centered on the bar itself, not
          on whatever the wordmark and the actions happen to leave over. With
          `justify-between` the nav's position was a function of the actions'
          width, so anything that changed size there — a studio pill that grows
          on its own page, a user menu that appears once you sign in — slid the
          whole nav sideways.

          `minmax(0,1fr)` and not a bare `1fr`: `1fr` keeps an automatic minimum
          of its own content, so a side wider than the room left over still
          grows past its share and pushes the nav off center — measured at
          19.5px on sigscape.org's studio page at 1024px, which is exactly the
          bug this is meant to end. Letting the columns go below their content
          width is what makes them equal at every viewport. Consumers keep the
          side content narrow enough that the overflow is never reached.

          Every child names its column. Below `md` the nav is `hidden`, and
          `display:none` takes it out of the grid altogether rather than leaving
          an empty track — so with auto-placement the actions slid up into
          column 2 and the menu button sat stranded mid-bar on every phone.
          Explicit columns make the layout independent of how many children
          happen to be rendered. */}
      <div className="mx-auto grid h-14 max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 sm:h-16 sm:px-6">
        <Link href={homeHref} className="col-start-1 flex items-center justify-self-start text-foreground">
          {logo}
        </Link>

        <nav className="col-start-2 hidden items-center gap-6 md:flex">
          {nav.map((item) =>
            isDropdown(item) ? (
              <Dropdown key={item.label} item={item} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={`rounded-md px-2 text-base font-medium text-foreground transition-colors hover:bg-muted-foreground/12 ${
                  isActive(item.href)
                    ? "pointer-events-none bg-muted-foreground/12"
                    : "bg-transparent"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="col-start-3 flex items-center gap-4 justify-self-end">
          <ThemeToggle />
          {actions}
          {nav.length > 0 && (
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-muted-foreground/12 md:hidden"
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {mobileOpen && nav.length > 0 && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {nav.map((item) =>
              isDropdown(item) ? (
                <MobileDropdown
                  key={item.label}
                  item={item}
                  onNavigate={closeMobile}
                />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={closeMobile}
                  className="border-b border-border py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted-foreground/12"
                >
                  {item.label}
                </Link>
              ),
            )}
            {mobileActions && (
              <div className="mt-4 flex justify-center">{mobileActions}</div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
