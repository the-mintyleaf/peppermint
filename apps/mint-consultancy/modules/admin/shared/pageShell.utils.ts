export function buildBreadcrumbItems(basePath: string) {
  const parts = basePath.split("/").filter(Boolean);
  return parts.map((part, index) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1),
    href: "/" + parts.slice(0, index + 1).join("/"),
  }));
}
