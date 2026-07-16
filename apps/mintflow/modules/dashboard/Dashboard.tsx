"use client";

import { useState } from "react";

import { useMediaQuery } from "@peppermint/ui";

import { Screen } from "@/components";

import { DASHBOARD_DATA } from "./Dashboard.data";
import type { Period } from "./Dashboard.types";
import { DashboardDesktop } from "./components/DashboardDesktop";
import { DashboardMobile } from "./components/DashboardMobile";

/**
 * Reports dashboard — the one screen with distinct mobile and desktop layouts.
 * Dark surface, pure-CSS flex-bar charts (no chart library), Week/Month toggle
 * over two static mock datasets.
 *
 * States: this is a static mock, so loading / request-failed / empty / permission
 * / read-only / archived / conflicting-edit / long-running-job / async-error are
 * all N/A. Data-freshness is covered by the header cue ("MON · 28.03 · ALL ON
 * TRACK" + the period range) which acts as the "as of" indicator.
 */
export function ModuleDashboard() {
  const [period, setPeriod] = useState<Period>("Week");
  // useMediaQuery is undefined on the SSR/first paint — default to mobile.
  const isDesktop = useMediaQuery("(min-width: 62em)") ?? false;

  const data = DASHBOARD_DATA[period];

  return (
    <Screen dark fluid px={0}>
      {isDesktop ? (
        <DashboardDesktop
          period={period}
          onPeriodChange={setPeriod}
          data={data}
        />
      ) : (
        <DashboardMobile
          period={period}
          onPeriodChange={setPeriod}
          data={data}
        />
      )}
    </Screen>
  );
}
