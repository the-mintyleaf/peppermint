export interface HomeHeaderBreadcrumbItem {
  label: string;
  href?: string;
}

export interface HomeHeaderChatItem {
  id: string;
  title: string;
}

export interface HomeHeaderProps {
  breadcrumbItems?: HomeHeaderBreadcrumbItem[];
  currentChatTitle: string;
  pastChats: HomeHeaderChatItem[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat?: () => void;
  onClearHistory?: () => void;
}
