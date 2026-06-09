import { DummyPage } from "@/modules/admin/DummyPage";

interface ContentPageProps {
  params: {
    slug?: string[];
  };
}

export default function ContentPage({ params }: ContentPageProps) {
  const page = params.slug?.join(" / ") ?? "posts";

  return <DummyPage title={`Content — ${page}`} />;
}
