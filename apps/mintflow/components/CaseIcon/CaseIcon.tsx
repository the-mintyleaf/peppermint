"use client";

import type { Icon } from "@phosphor-icons/react";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { NewspaperIcon } from "@phosphor-icons/react/dist/csr/Newspaper";
import { FolderSimpleIcon } from "@phosphor-icons/react/dist/csr/FolderSimple";
import { CurrencyCircleDollarIcon } from "@phosphor-icons/react/dist/csr/CurrencyCircleDollar";
import { ShieldIcon } from "@phosphor-icons/react/dist/csr/Shield";
import { Box } from "@peppermint/ui";

import type { CaseIconKind, CaseIconProps } from "./CaseIcon.types";

const ICONS: Record<CaseIconKind, Icon> = {
  case: FileTextIcon,
  press: NewspaperIcon,
  folder: FolderSimpleIcon,
  finance: CurrencyCircleDollarIcon,
  security: ShieldIcon,
};

/**
 * Rounded tinted square holding a category glyph — used for work
 * collections, the dashboard's top case, and AI suggestion rows.
 */
export function CaseIcon({
  kind,
  color = "rgb(238,87,41)",
  tint = "rgba(238,87,41,0.12)",
  size = 46,
  iconSize,
  radius = 13,
}: CaseIconProps) {
  const Glyph = ICONS[kind] ?? FileTextIcon;
  return (
    <Box
      style={{
        width: size,
        height: size,
        flex: "0 0 auto",
        borderRadius: radius,
        background: tint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Glyph size={iconSize ?? Math.round(size * 0.48)} color={color} />
    </Box>
  );
}
