// English number-to-words for currency amounts on bank certificates.
// NOTE: uses the INTERNATIONAL system (thousand / million / billion). If the
// certificates should use the South-Asian system (lakh / crore), swap SCALES
// and the grouping in `intToWords` — this is the only place that encodes it.

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const SCALES = ["", "Thousand", "Million", "Billion", "Trillion"];

function threeDigitsToWords(n: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest < 20) {
    if (rest) parts.push(ONES[rest]);
  } else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    parts.push(o ? `${TENS[t]} ${ONES[o]}` : TENS[t]);
  }
  return parts.join(" ");
}

/** Converts a non-negative integer to Title-Case English words. Returns "Zero" for 0. */
export function intToWords(value: number): string {
  let n = Math.floor(Math.abs(value));
  if (n === 0) return "Zero";

  const groups: number[] = [];
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const words = threeDigitsToWords(groups[i]);
    parts.push(SCALES[i] ? `${words} ${SCALES[i]}` : words);
  }
  return parts.join(" ");
}

/**
 * Formats a currency amount in words, e.g. `123456.5` → "Rupees One Hundred Twenty Three
 * Thousand Four Hundred Fifty Six and Fifty Paisa Only".
 */
export function currencyInWords(
  amount: number,
  unit = "Rupees",
  subUnit = "Paisa",
): string {
  const safe = Number.isFinite(amount) ? Math.abs(amount) : 0;
  const rupees = Math.floor(safe);
  const paisa = Math.round((safe - rupees) * 100);

  let result = `${unit} ${intToWords(rupees)}`;
  if (paisa > 0) result += ` and ${intToWords(paisa)} ${subUnit}`;
  return `${result} Only`;
}
