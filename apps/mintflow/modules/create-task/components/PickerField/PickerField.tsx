"use client";

import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { Box, Group, Text, UnstyledButton } from "@peppermint/ui";

import { StatusPill } from "@/components";
import { tokens } from "@/config/design";

import { PropertyRow } from "../PropertyRow";
import type { PickerFieldProps } from "./PickerField.types";

/**
 * A property row whose value is a color chip that expands an inline dropdown of
 * options (Status / Priority). Only one picker is open at a time — the parent
 * owns the single `picker` state and passes `open`.
 */
export function PickerField({
  icon,
  label,
  options,
  value,
  open,
  chipDot = false,
  onToggle,
  onSelect,
}: PickerFieldProps) {
  const selected = options.find((o) => o.key === value) ?? options[0];

  return (
    <Box>
      <PropertyRow icon={icon} label={label} onClick={onToggle} expanded={open}>
        <Group justify="space-between" wrap="nowrap" gap={8} w="100%">
          <StatusPill
            fg={selected.fg}
            bg={selected.bg}
            border={selected.border}
            dot={chipDot ? (selected.dot ?? selected.fg) : false}
            fz="12px"
            radius={8}
            px={11}
            py={6}
          >
            {selected.label}
          </StatusPill>
          <CaretDownIcon
            size={14}
            color={tokens.muted}
            style={{
              flex: "0 0 auto",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform .18s ease",
            }}
          />
        </Group>
      </PropertyRow>

      {open ? (
        <Box
          role="listbox"
          aria-label={`${label} options`}
          style={{
            marginLeft: 104,
            marginTop: 2,
            marginBottom: 6,
            border: `1px solid ${tokens.line}`,
            borderRadius: 13,
            background: tokens.paper,
            boxShadow: tokens.shadow.card,
            overflow: "hidden",
          }}
        >
          {options.map((o) => {
            const active = o.key === value;
            return (
              <UnstyledButton
                key={o.key}
                role="option"
                aria-selected={active}
                onClick={() => onSelect(o.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 12px",
                  background: active ? "rgba(0,0,0,0.03)" : "transparent",
                }}
              >
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: o.dot ?? o.fg,
                    flex: "0 0 auto",
                  }}
                />
                <Text
                  fz={13}
                  fw={500}
                  style={{ flex: 1, textAlign: "left", color: tokens.ink }}
                >
                  {o.label}
                </Text>
                {active ? (
                  <CheckIcon size={15} weight="bold" color={o.fg} />
                ) : null}
              </UnstyledButton>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}
