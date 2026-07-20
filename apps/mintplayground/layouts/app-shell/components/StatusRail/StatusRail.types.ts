export interface StatusRailProps {
  /** Label of the nav destination currently active, e.g. "Home". */
  section?: string;
  /** The live pathname — the rail's centre slot doubles as a route readout. */
  pathname: string;
  /** Build marker in the right slot. */
  version: string;
}
