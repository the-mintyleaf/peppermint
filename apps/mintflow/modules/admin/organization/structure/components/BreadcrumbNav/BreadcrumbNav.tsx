"use client";

import { ActionIcon, Tooltip } from "@peppermint/ui";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

import styles from "../../Structure.module.css";
import type { BreadcrumbNavProps } from "./BreadcrumbNav.types";

export function BreadcrumbNav({
  path,
  onNavigate,
  onExitFocus,
}: BreadcrumbNavProps) {
  return (
    <div className={styles.breadcrumbNav}>
      {path.map((item, index) => {
        const isLast = index === path.length - 1;
        return (
          <span key={item.id}>
            {isLast ? (
              <span className={styles.breadcrumbItemCurrent}>{item.label}</span>
            ) : (
              <span
                className={styles.breadcrumbItem}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </span>
            )}
            {!isLast && <span className={styles.breadcrumbSeparator}> / </span>}
          </span>
        );
      })}
      <Tooltip label="Exit focus" position="top" withArrow>
        <ActionIcon
          size="xs"
          variant="subtle"
          onClick={onExitFocus}
          aria-label="Exit focus"
        >
          <XIcon size={12} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
