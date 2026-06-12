export function formatEditedAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 1) return "Edited just now";
  if (mins < 60) return `Edited ${mins} minute${mins === 1 ? "" : "s"} ago`;
  if (hrs < 24) return `Edited ${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  if (days < 7) return `Edited ${days} day${days === 1 ? "" : "s"} ago`;

  const date = new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `Edited ${date}`;
}
