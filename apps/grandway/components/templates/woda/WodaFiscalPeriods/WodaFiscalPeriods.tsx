"use client";

import { wodaTextProps } from "../wodaProps";
import { fiscalYears } from "../wodaFormat";
import { WodaOrdinalDate } from "../WodaOrdinalDate";
import type { WodaFiscalPeriodsProps } from "./WodaFiscalPeriods.types";

/** "1. Fiscal Year 2023/2024 A.D. (For the period of 17th July, 2023 A.D. to …)" */
export function WodaFiscalPeriods({ values }: WodaFiscalPeriodsProps) {
  return (
    <ol
      style={{
        margin: 0,
        paddingLeft: "0.55in",
        fontSize: wodaTextProps.size,
        lineHeight: wodaTextProps.lh,
      }}
    >
      {fiscalYears(values).map((year, index) => (
        <li key={index}>
          Fiscal Year {year.label} A.D.
          {/* Letters saved before periods were recorded print the year alone. */}
          {Boolean(year.start || year.end) && (
            <>
              {" "}
              (For the period of <WodaOrdinalDate
                value={year.start}
                withEra
              />{" "}
              to <WodaOrdinalDate value={year.end} withEra />)
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
