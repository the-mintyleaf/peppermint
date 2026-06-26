import { redirect } from "next/navigation";

export default function OrgDetailPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/admin/organization/${params.id}/structure`);
}
