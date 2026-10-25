"use client";

import { Text } from "@peppermint/ui";
import { wodaTitleProps } from "../wodaProps";
import type { WodaSubjectProps } from "./WodaSubject.types";

/** The centred subject line every WODA letter opens with. */
export function WodaSubject({ title, variant }: WodaSubjectProps) {
  if (variant === "plain") {
    return (
      <Text {...wodaTitleProps} ta="center" fw={700} mt=".2in" mb=".35in">
        Subject: <u>{title}</u>
      </Text>
    );
  }

  return (
    <Text
      {...wodaTitleProps}
      ta="center"
      tt="uppercase"
      fw={700}
      mt=".2in"
      mb=".3in"
    >
      Subject: <u>{title}</u>
      <br />
      <u>To whom it may concern</u>
    </Text>
  );
}
