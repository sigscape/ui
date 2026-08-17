/**
 * @sigscape/ui — the shared design system for sigscape.org and
 * mutopia.sigscape.org.
 *
 * Ships TypeScript source, not a build: consuming apps list this package in
 * `transpilePackages` and Next compiles it with the rest of the app. That keeps
 * `"use client"` boundaries intact, which is the usual way prebuilt component
 * packages break under the App Router.
 *
 * Design tokens live in `@sigscape/ui/tokens.css` and are imported separately.
 * The binding style guide is README.md in this package.
 */

export { cn } from "./utils";

export {
  worstLevel,
  type Diagnostic,
  type DiagnosticLevel,
} from "./diagnostics";

export { Button, buttonVariants } from "./components/button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./components/card";

export { Tooltip } from "./components/Tooltip";
export { HelpTip } from "./components/HelpTip";
export { LabelTip } from "./components/LabelTip";
export {
  Modal,
  PortalHostProvider,
  usePortalTarget,
  useScrollLock,
} from "./components/Modal";
export { Segmented } from "./components/Segmented";
export { Diagnostics } from "./components/Diagnostics";
export {
  SigLoader,
  DeferredMount,
  type SigLoaderStyle,
  type SigLoaderHandle,
} from "./components/SigLoader";
export { Tags } from "./components/Tag";

export {
  SectionIndex,
  useActiveSection,
  type SectionIndexItem,
} from "./components/SectionIndex";
export { ThemeProvider, themeScript } from "./theme/ThemeProvider";
export { ThemeToggle } from "./theme/ThemeToggle";

export { TopBar, type NavItem, type NavChild } from "./layout/TopBar";
export {
  SigscapeWordmark,
  SigscapeMark,
} from "./layout/SigscapeWordmark";
export {
  BottomBar,
  type FooterLink,
  type FooterSection,
} from "./layout/BottomBar";
