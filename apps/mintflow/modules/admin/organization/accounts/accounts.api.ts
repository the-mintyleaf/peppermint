import type { QueryParams } from "@peppermint/admin";
import type { Account, AccountsFetchResponse } from "./accounts.types";

const MOCK_ACCOUNTS: Account[] = [
  {
    id: "1",
    fullName: "Ram Bahadur Thapa",
    address: "Singha Durbar, Kathmandu",
    birthday: "1975-04-12",
    roleId: "2",
    roleName: "Manager",
    personalizedPermissions: [],
    status: "active",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    fullName: "Sita Sharma",
    address: "Kalikasthan, Kathmandu",
    birthday: "1980-08-22",
    roleId: "3",
    roleName: "Staff",
    personalizedPermissions: [
      { area: "reports", actions: ["view", "create"] },
    ],
    status: "active",
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
  {
    id: "3",
    fullName: "Hari Prasad Adhikari",
    address: "Tripureshwor, Kathmandu",
    birthday: "1970-12-05",
    roleId: "1",
    roleName: "Super Admin",
    personalizedPermissions: [],
    status: "active",
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
  },
  {
    id: "4",
    fullName: "Bishnu Kumar Shrestha",
    address: "Babar Mahal, Kathmandu",
    birthday: "1985-03-18",
    roleId: "3",
    roleName: "Staff",
    personalizedPermissions: [],
    status: "inactive",
    createdAt: "2025-01-04T00:00:00Z",
    updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "5",
    fullName: "Dasharath Dhakal",
    address: "Naxal, Kathmandu",
    birthday: "1968-11-30",
    roleId: "4",
    roleName: "Auditor",
    personalizedPermissions: [
      { area: "settings", actions: ["view"] },
    ],
    status: "active",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-05T00:00:00Z",
  },
];

export async function fetchAccounts(params?: QueryParams): Promise<AccountsFetchResponse> {
  let data = [...MOCK_ACCOUNTS];

  if (params?.filters?.status) {
    data = data.filter((a) => a.status === params.filters!.status);
  }
  if (params?.filters?.roleId) {
    data = data.filter((a) => a.roleId === params.filters!.roleId);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        (a.roleName ?? "").toLowerCase().includes(q) ||
        a.address.toLowerCase().includes(q),
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

export async function fetchAccount(id: string): Promise<Account> {
  const account = MOCK_ACCOUNTS.find((a) => a.id === id);
  if (!account) throw new Error(`Account not found: ${id}`);
  return account;
}

export async function createAccount(data: Partial<Account>): Promise<Account> {
  const now = new Date().toISOString();
  return {
    ...data,
    id: String(Date.now()),
    personalizedPermissions: data.personalizedPermissions ?? [],
    createdAt: now,
    updatedAt: now,
  } as Account;
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account> {
  return { ...data, id, updatedAt: new Date().toISOString() } as Account;
}

export async function deleteAccount(id: string): Promise<void> {
  void id;
}
