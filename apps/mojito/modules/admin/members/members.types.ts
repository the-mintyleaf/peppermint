export type MembershipType = "basic" | "premium";
export type MemberStatus = "active" | "suspended";

export interface Member extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: MembershipType;
  joinedDate: string;
  status: MemberStatus;
}

export interface MembersFetchResponse {
  data: Member[];
  meta: { total: number; page: number; pageSize: number };
}
