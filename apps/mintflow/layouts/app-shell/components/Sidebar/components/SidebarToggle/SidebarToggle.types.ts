export interface SidebarToggleProps {
  /** Whether the panel is currently collapsed to the icon rail. */
  collapsed: boolean;
  /** Flip the collapsed state. */
  onToggle: () => void;
}
