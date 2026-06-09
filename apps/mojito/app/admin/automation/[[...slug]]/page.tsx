import { DummyPage } from "@/modules/admin/DummyPage";

interface AutomationPageProps {
  params: {
    slug?: string[];
  };
}

export default function AutomationPage({ params }: AutomationPageProps) {
  const page = params.slug?.join(" / ") ?? "workflows";

  return <DummyPage title={`Automation — ${page}`} />;
}
