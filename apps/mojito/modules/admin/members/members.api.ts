import type { QueryParams } from "@peppermint/admin";
import type { Member, MembersFetchResponse } from "./members.types";

const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-555-0101",
    membershipType: "premium",
    joinedDate: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1-555-0102",
    membershipType: "basic",
    joinedDate: "2024-03-20",
    status: "active",
  },
  {
    id: "3",
    name: "Carol White",
    email: "carol@example.com",
    phone: "+1-555-0103",
    membershipType: "basic",
    joinedDate: "2023-11-05",
    status: "suspended",
  },
];

export async function fetchMembers(
  params?: QueryParams,
): Promise<MembersFetchResponse> {
  let data = [...MOCK_MEMBERS];
  if (params?.filters?.status) {
    data = data.filter((m) => m.status === params.filters!.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  return {
    data: data.slice(start, start + pageSize),
    meta: { total: data.length, page, pageSize },
  };
}

export async function createMember(values: Partial<Member>): Promise<Member> {
  return { ...values, id: String(Date.now()) } as Member;
}

export async function updateMember(
  id: string,
  values: Partial<Member>,
): Promise<Member> {
  return { ...values, id } as Member;
}

export async function deleteMember(id: string): Promise<void> {
  void id;
}
