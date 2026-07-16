export interface BreadcrumbPathItem {
  id: string;
  label: string;
}

export interface BreadcrumbNavProps {
  path: BreadcrumbPathItem[];
  onNavigate: (id: string) => void;
  onExitFocus: () => void;
}
