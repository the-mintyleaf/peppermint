import type { ProfileSectionTileConfig } from "./sectionTiles";

export interface ProfileSectionTileProps {
  tile: ProfileSectionTileConfig;
  /** Called on activation so the host modal can close as navigation begins. */
  onNavigate: () => void;
}
