export interface TeamMemberRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatarUrl?: string;
  joinedAt: Date;
  status: "active" | "invited" | "suspended";
}

export interface TeamFetchResponse {
  data: TeamMemberRow[];
  meta: { total: number; page: number; pageSize: number };
}
