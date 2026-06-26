import { EventLog } from "../../../../../modules/admin/organization/event-log";

export default function EventLogPage({ params }: { params: { id: string } }) {
  return <EventLog orgId={params.id} />;
}
