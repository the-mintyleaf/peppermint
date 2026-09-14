interface WorklistDrawerBaseProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Two ways in, one surface.
 *
 * `applicantId` — everything this applicant has: the drawer opens on the
 * picker, and a pick swaps it to that worklist's profile with a way back.
 *
 * `worklistId` — one known worklist (a journey row already knows which):
 * the drawer opens straight on the profile, with no picker behind it.
 */
export type WorklistDrawerProps = WorklistDrawerBaseProps &
  (
    | { applicantId: string; worklistId?: never }
    | { worklistId: string; applicantId?: never }
  );
