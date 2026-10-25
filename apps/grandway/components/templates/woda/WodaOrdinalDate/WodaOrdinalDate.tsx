"use client";

import { getDaySuffix } from "@/components/helper/getDaySuffix";
import { MONTH_NAMES, toDate } from "../wodaFormat";
import type { WodaOrdinalDateProps } from "./WodaOrdinalDate.types";

/** "17ᵗʰ July, 2023" — blank space when the date is missing, so the line can be hand-filled. */
export function WodaOrdinalDate({ value, withEra }: WodaOrdinalDateProps) {
  const date = toDate(value);
  if (!date) {
    return <span style={{ display: "inline-block", width: "1.2in" }} />;
  }

  return (
    <>
      {date.getDate()}
      <sup style={{ fontSize: "0.6em" }}>
        {getDaySuffix(date.getDate())}
      </sup>{" "}
      {MONTH_NAMES[date.getMonth()]}, {date.getFullYear()}
      {withEra && " A.D."}
    </>
  );
}
