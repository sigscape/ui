"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils";

/**
 * An explicit host to portal overlays into. The studio sets this to its shell
 * while "maximized" (a CSS fixed-inset viewport fill, not native fullscreen) so
 * modals and menus render *inside* it and stack above its content. Unset
 * everywhere else, so overlays fall back to `document.body`.
 */
const PortalHostContext = React.createContext<HTMLElement | null>(null);
export const PortalHostProvider = PortalHostContext.Provider;

/**
 * The element to portal overlays into: the explicit host from `PortalHostContext`
 * when one is set (the maximized studio shell), otherwise `document.body`. `null`
 * until mounted, so it gates SSR portals too.
 */
export function usePortalTarget(): HTMLElement | null {
  const host = React.useContext(PortalHostContext);
  // Client-only `document.body` (null during SSR, so it gates SSR portals)
  // without a state-syncing effect.
  const body = React.useSyncExternalStore(
    () => () => {},
    () => document.body,
    () => null,
  );
  return host ?? body;
}

/** Lock the page behind a modal: no body scroll, no layout shift from the scrollbar. */
export function useScrollLock() {
  React.useEffect(() => {
    const { body, documentElement } = document;
    const scrollBarWidth = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollBarWidth > 0) body.style.paddingRight = `${scrollBarWidth}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, []);
}

/**
 * Centered modal dialog. Portals over a backdrop that blocks the page behind it
 * (no body scroll; void clicks and Escape close). The portal target is the
 * current native-fullscreen element when one is active (so modals appear *inside*
 * a full-screen studio, not hidden behind it), otherwise `document.body`. The
 * panel is `children`, sized via `className`.
 */
export function Modal({
  onClose,
  label,
  className,
  children,
}: {
  onClose: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const container = usePortalTarget();
  useScrollLock();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!container) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative", className)}>{children}</div>
    </div>,
    container,
  );
}
