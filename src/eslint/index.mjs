/**
 * Design-system lint rules, shared by sigscape-client and mutopia-client.
 *
 * `skills.md` bans the flat grey tokens outright: readable content stays full
 * `text-foreground`, and hierarchy comes from weight and size, not opacity.
 * Surfaces use the `bg-muted-foreground/12` tint rather than the solid `muted`
 * token. That rule survived one repo and not the other for a year, which is why
 * it is now checked instead of remembered.
 *
 * Allowed and deliberately not matched: `muted-foreground` *with* an opacity
 * suffix (`bg-muted-foreground/12`, `hover:bg-muted-foreground/24`).
 */

const BANNED = String.raw`(text-muted-foreground|bg-muted(?![\w-])|border-muted(?![\w-]))`;

const MESSAGE =
  "Banned grey token. Content text is full `text-foreground` (reserve /60 for micro-labels, /40 for hints, /30 for placeholder icons); surfaces use `bg-muted-foreground/12` -> `hover:bg-muted-foreground/24`; borders use `border-border`. See skills.md.";

/** Flat-config fragment. Spread it into the app's eslint.config.mjs. */
export const designSystem = [
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=/${BANNED}/]`, message: MESSAGE },
        { selector: `TemplateElement[value.raw=/${BANNED}/]`, message: MESSAGE },
      ],
    },
  },
];

export default designSystem;
