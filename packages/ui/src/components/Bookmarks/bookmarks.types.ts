export interface Bookmark {
  id: string;
  label: string;
  href: string;
  createdAt: string;
}

export interface BookmarkInput {
  id: string;
  label: string;
  href?: string;
}

export interface BookmarkButtonProps {
  id: string;
  label: string;
  href?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  addTooltip?: string;
  removeTooltip?: string;
}

export interface BookmarksMenuProps {
  onNavigate?: (href: string) => void;
  variant?: "default" | "sidenav";
  emptyLabel?: string;
  label?: string;
}
