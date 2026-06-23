"use client";

import { useState } from "react";
import { Box, Group, Stack, Text } from "@peppermint/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { ANALYTICS_COLORS, darkCardStyle } from "../../taskAnalytics.styles";
import type { ArchiveProjectsProps } from "./ArchiveProjects.types";

const APP_LABELS: Record<ArchiveProjectsProps["projects"][number]["app"], string> = {
  framer: "Fr",
  figma: "Fi",
  webflow: "Wf",
};

export function ArchiveProjects({ projects }: ArchiveProjectsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>("arch-3");

  return (
    <Box style={darkCardStyle()}>
      <Group justify="space-between" mb="md">
        <Text c={ANALYTICS_COLORS.textPrimary} fw={700} size="md">
          Archive Project
        </Text>
        <DotsThreeIcon size={20} color={ANALYTICS_COLORS.textMuted} aria-label="More options" style={{ cursor: "pointer" }} />
      </Group>

      <Stack gap="sm">
        {projects.map((project) => {
          const isHovered = hoveredId === project.id;
          return (
            <Group
              key={project.id}
              gap="sm"
              wrap="nowrap"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                cursor: "pointer",
                background: isHovered ? "rgba(255,255,255,0.06)" : "transparent",
                boxShadow: isHovered ? `0 0 16px rgba(67,83,255,0.2)` : "none",
                transition: "all 0.15s ease",
              }}
            >
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: project.appColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Text size="10px" fw={700} c="white">
                  {APP_LABELS[project.app]}
                </Text>
              </Box>
              <Text
                size="sm"
                c={ANALYTICS_COLORS.textPrimary}
                style={{ flex: 1 }}
                lineClamp={1}
              >
                {project.name}
              </Text>
              {isHovered && (
                <DownloadSimpleIcon
                  size={18}
                  color={ANALYTICS_COLORS.accentOrange}
                  aria-label="Download"
                />
              )}
            </Group>
          );
        })}
      </Stack>
    </Box>
  );
}
