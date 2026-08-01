// One type scale for the whole dashboard, so a figure is the same size wherever
// it appears and rank is legible at a squint (DESIGN.md §1.1 — hierarchy is
// contrast, and it only works if the steps are few and consistent).
//
// Five roles, each a clear step apart. Anything that does not fit one of these
// roles is almost certainly a sixth thing that should not exist.

/** The page-level anchor: the greeting. Nothing else on the page is this size. */
export const TYPE_GREETING = { fz: 30, fw: 700, lh: 1.15 } as const;

/** A section band's title ("Leads", "Applicants"). One per band. */
export const TYPE_SECTION = { fz: 19, fw: 600, lh: 1.2 } as const;

/** A card's own title, inside its header row. */
export const TYPE_CARD_TITLE = { fz: 15, fw: 600, lh: 1.3 } as const;

/** The one figure a card exists to show. */
export const TYPE_FIGURE_LG = { fz: 34, fw: 700, lh: 1.05 } as const;

/** A supporting figure — a small tile, or a legend value. */
export const TYPE_FIGURE_SM = { fz: 22, fw: 700, lh: 1.1 } as const;

/** Tightening that reads as deliberate at display sizes, sloppy at body sizes. */
export const DISPLAY_TRACKING = { letterSpacing: "-0.02em" } as const;
