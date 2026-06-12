import { ModuleRunsView } from "@/modules/admin/automation-runs";

export default function RunDetailPage({ params }: { params: { id: string } }) {
  return <ModuleRunsView id={params.id} />;
}
