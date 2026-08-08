# @sigscape/ui

Design tokens and UI primitives shared by **sigscape.org** (`sigscape/sigscape-client`)
and **mutopia.sigscape.org** (`sigscape/mutopia-client`), so the two domains read
as one product instead of two sites that happen to use the same framework.

The binding style guide is **`skills.md` in `sigscape-client`** — colours, button
and dropdown styles, help tooltips, diagnostics, radii. It stays there because
`CLAUDE.md` imports it and it must auto-load in that repo. This package is where
those rules are *implemented*; change a rule there, change the primitive here.

## What's in here

| Layer | Contents |
| --- | --- |
| Tokens | `tokens.css` — `@custom-variant dark`, `:root` / `.dark` palettes, `@theme inline` bridge, base layer, `.scrollbar-none`, `.sig-loader` keyframes |
| Primitives | `Button`, `Card`, `Tooltip`, `HelpTip`, `LabelTip`, `Modal`, `Segmented`, `Diagnostics`, `SigLoader`, `Tags`, `cn` |
| Theme | `ThemeProvider`, `ThemeToggle` (next-themes) |
| Contracts | `Diagnostic`, `DiagnosticLevel`, `worstLevel` — the plain-data diagnostics model the renderer draws |

App-owned, deliberately **not** here: nav/site config, logos, auth, i18n, and
every domain component (the sigscape studio, the MuTopia atlas).

## Consuming it

```jsonc
// package.json
"dependencies": {
  "@sigscape/ui": "github:sigscape/ui#v0.1.0"
}
```

```ts
// next.config.ts — required: this package ships TypeScript source, not a build
const nextConfig: NextConfig = { transpilePackages: ["@sigscape/ui"] };
```

```css
/* app/globals.css — tokens must come after Tailwind */
@import "tailwindcss";
@import "@sigscape/ui/tokens.css";
```

`tokens.css` carries its own `@source "."`, so consumers do not have to know the
path. **This is load-bearing:** Tailwind v4 does not scan `node_modules`, and
without it every class name used inside this package is dropped from the
generated CSS and the primitives ship unstyled.

## Why source and not a build

Next transpiles the package with the app, so `"use client"` directives survive
intact. Bundling client components ahead of time is the usual way a shared
component package breaks under the App Router, and skipping the build step also
means a git dependency installs with no `prepare` hook.

Every runtime dependency is a **peer**, so the apps control versions. Note that
`lucide-react` is pinned to `^1` — a consumer still on `0.x` must bump first.

## Releasing

Tag it: `git tag v0.2.0 && git push --tags`. Consumers move their `#v0.1.0` ref
deliberately. The version pinning is the whole reason this is a package instead
of a git submodule.
