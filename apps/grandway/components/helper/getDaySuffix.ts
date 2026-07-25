/**
 * Ordinal suffix for a day of the month (1 → "st", 2 → "nd", 3 → "rd", 4 → "th", …).
 * Handles the 11–13 exception. Used by document templates to render dates like "21st".
 */
export function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
