import { SiteNew } from "../../../../../../modules/admin/organization/sites";

export default function SiteNewPage({ params }: { params: { id: string } }) {
  return <SiteNew orgId={params.id} />;
}
