/**
 * A shared, plain-data model for content-level diagnostics — the precise,
 * actionable messages we show when a file's *type* is right but its *content*
 * can't actually drive the thing the user asked for (e.g. an exposure table H
 * whose signature names don't match the signature matrix W, so the mutation
 * spectra X can't be reconstructed).
 *
 * Capability gating (lib/capabilities.ts) stays type-only — a function still
 * appears for a matching file type. Diagnostics layer on top: parsers attach
 * them to a `Dataset`, capabilities validate a binding, and the editor reads
 * them off a reconstructed object. One renderer (components/ui/Diagnostics) draws
 * them all, so the studio reads as one system.
 *
 * Plain data only (no JSX) so it can be produced anywhere in `lib/` and survive
 * JSON round-trips through sessionStorage.
 */

export type DiagnosticLevel = "error" | "warning" | "info";

export interface Diagnostic {
  level: DiagnosticLevel;
  /** Terse headline — the specific thing that's wrong. */
  title: string;
  /** Plain, concrete: what's wrong and how to fix it. One or two sentences. */
  detail: string;
  /**
   * Optional supporting name lists (e.g. the unmatched H signatures and the W
   * columns), rendered as wrapped chips so the user can see exactly what didn't
   * line up. Long lists are truncated by the renderer.
   */
  lists?: { label: string; items: string[] }[];
}

const RANK: Record<DiagnosticLevel, number> = { info: 0, warning: 1, error: 2 };

/** The most severe level present, or null for an empty/absent set. */
export function worstLevel(ds: Diagnostic[] | undefined): DiagnosticLevel | null {
  if (!ds || ds.length === 0) return null;
  return ds.reduce<DiagnosticLevel>((acc, d) => (RANK[d.level] > RANK[acc] ? d.level : acc), "info");
}
