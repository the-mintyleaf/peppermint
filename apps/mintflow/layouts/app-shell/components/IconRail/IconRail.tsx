"use client";

import { usePathname, useRouter } from "next/navigation";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { Tooltip, UnstyledButton } from "@peppermint/ui";

import { useAppShellStore } from "../../app-shell.store";
import { NAV_DESTINATIONS, isDestinationActive } from "../../nav.config";
import classes from "./IconRail.module.css";

/**
 * Desktop left navigation rail — brand, ＋ create, the four destinations, and a
 * profile avatar. Same destinations as the mobile bottom pill.
 */
export function IconRail() {
  const pathname = usePathname();
  const router = useRouter();
  const openCreateTask = useAppShellStore((s) => s.openCreateTask);

  return (
    <nav className={classes.rail} aria-label="Primary">
      <div className={classes.brand}>k</div>

      <div className={classes.items}>
        <Tooltip label="Create task" position="right" withArrow>
          <UnstyledButton
            className={classes.create}
            onClick={openCreateTask}
            aria-label="Create task"
          >
            <PlusIcon size={22} weight="bold" color="#fff" />
          </UnstyledButton>
        </Tooltip>

        {NAV_DESTINATIONS.map((d) => {
          const active = isDestinationActive(d.href, pathname);
          const Icon = d.icon;
          return (
            <Tooltip key={d.id} label={d.label} position="right" withArrow>
              <UnstyledButton
                className={`${classes.btn}${active ? ` ${classes.btnActive}` : ""}`}
                onClick={() => router.push(d.href)}
                aria-label={d.label}
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <span className={classes.marker} aria-hidden />
                ) : null}
                <Icon
                  size={22}
                  weight={active ? "fill" : "regular"}
                  color={active ? "#fff" : "rgba(255,255,255,0.4)"}
                />
              </UnstyledButton>
            </Tooltip>
          );
        })}

        <Tooltip label="Settings" position="right" withArrow>
          <UnstyledButton
            className={classes.btn}
            onClick={() => router.push("/settings")}
            aria-label="Settings"
          >
            <GearSixIcon size={22} color="rgba(255,255,255,0.4)" />
          </UnstyledButton>
        </Tooltip>
      </div>

      <div className={classes.avatar} aria-hidden />
    </nav>
  );
}
