import { SiteList } from "../../../../../modules/admin/organization/sites";

export default function SitesPage({ params }: { params: { id: string } }) {
  return <SiteList orgId={params.id} />;
}
