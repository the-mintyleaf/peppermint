"use client";

import { usePathname, useRouter } from "next/navigation";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UnstyledButton } from "@peppermint/ui";

import { useAppShellStore } from "../../app-shell.store";
import { NAV_DESTINATIONS, isDestinationActive } from "../../nav.config";
import classes from "./BottomNav.module.css";

/**
 * Mobile floating navigation pill — Home · Tasks · ＋ · Reports · Files.
 * The ＋ opens the Create Task sheet; the four icons are route destinations.
 */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const openCreateTask = useAppShellStore((s) => s.openCreateTask);

  const [home, tasks, dashboard, files] = NAV_DESTINATIONS;
  const left = [home, tasks];
  const right = [dashboard, files];

  return (
    <>
      <div className={classes.fade} aria-hidden />
      <nav className={classes.wrap} aria-label="Primary">
        <div className={classes.pill}>
          {left.map((d) => (
            <NavButton
              key={d.id}
              d={d}
              active={isDestinationActive(d.href, pathname)}
              onGo={router.push}
            />
          ))}

          <UnstyledButton
            className={classes.create}
            onClick={openCreateTask}
            aria-label="Create task"
          >
            <PlusIcon size={18} weight="bold" color="#fff" />
          </UnstyledButton>

          {right.map((d) => (
            <NavButton
              key={d.id}
              d={d}
              active={isDestinationActive(d.href, pathname)}
              onGo={router.push}
            />
          ))}
        </div>
      </nav>
    </>
  );
}

function NavButton({
  d,
  active,
  onGo,
}: {
  d: (typeof NAV_DESTINATIONS)[number];
  active: boolean;
  onGo: (href: string) => void;
}) {
  const Icon = d.icon;
  return (
    <UnstyledButton
      className={classes.btn}
      onClick={() => onGo(d.href)}
      aria-label={d.label}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        size={23}
        weight={active ? "fill" : "regular"}
        color={active ? "#fff" : "rgba(255,255,255,0.5)"}
      />
    </UnstyledButton>
  );
}
