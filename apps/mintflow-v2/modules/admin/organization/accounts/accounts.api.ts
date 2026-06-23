import type { QueryParams } from "@peppermint/admin";
import type { Account, AccountsFetchResponse } from "./accounts.types";

const SEED_ACCOUNTS: Omit<Account, "id" | "createdAt" | "updatedAt">[] = [
  {
    fullName: "Ram Bahadur Thapa",
    email: "ram.bahadur@mintflow.local",
    phone: "+977 9801110001",
    address: "Singha Durbar, Kathmandu",
    birthday: "1975-04-12",
    roleId: "2",
    roleName: "Manager",
    personalizedPermissions: [],
    status: "active",
  },
  {
    fullName: "Sita Sharma",
    email: "sita.sharma@mintflow.local",
    phone: "+977 9801110002",
    address: "Kalikasthan, Kathmandu",
    birthday: "1980-08-22",
    roleId: "3",
    roleName: "Staff",
    personalizedPermissions: [{ area: "reports", actions: ["view", "create"] }],
    status: "active",
  },
  {
    fullName: "Hari Prasad Adhikari",
    email: "hari.adhikari@mintflow.local",
    phone: "+977 9801110003",
    address: "Tripureshwor, Kathmandu",
    birthday: "1970-12-05",
    roleId: "1",
    roleName: "Super Admin",
    personalizedPermissions: [],
    status: "active",
  },
  {
    fullName: "Bishnu Kumar Shrestha",
    email: "bishnu.shrestha@mintflow.local",
    phone: "+977 9801110004",
    address: "Babar Mahal, Kathmandu",
    birthday: "1985-03-18",
    roleId: "3",
    roleName: "Staff",
    personalizedPermissions: [],
    status: "inactive",
  },
  {
    fullName: "Dasharath Dhakal",
    email: "dasharath.dhakal@mintflow.local",
    phone: "+977 9801110005",
    address: "Naxal, Kathmandu",
    birthday: "1968-11-30",
    roleId: "4",
    roleName: "Auditor",
    personalizedPermissions: [{ area: "settings", actions: ["view"] }],
    status: "active",
  },
  { fullName: "Anita Gurung", email: "anita.gurung@mintflow.local", phone: "+977 9801110006", address: "Lazimpat, Kathmandu", birthday: "1992-01-14", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Prakash Maharjan", email: "prakash.maharjan@mintflow.local", phone: "+977 9801110007", address: "Patan Durbar, Lalitpur", birthday: "1988-06-03", roleId: "2", roleName: "Manager", personalizedPermissions: [], status: "active" },
  { fullName: "Mina Rai", email: "mina.rai@mintflow.local", phone: "+977 9801110008", address: "Bhaktapur Durbar Square", birthday: "1995-09-21", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Kiran Pokharel", email: "kiran.pokharel@mintflow.local", phone: "+977 9801110009", address: "Baneshwor, Kathmandu", birthday: "1983-11-08", roleId: "4", roleName: "Auditor", personalizedPermissions: [], status: "active" },
  { fullName: "Sunita Karki", email: "sunita.karki@mintflow.local", phone: "+977 9801110010", address: "Koteshwor, Kathmandu", birthday: "1990-04-27", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "suspended" },
  { fullName: "Ramesh Basnet", email: "ramesh.basnet@mintflow.local", phone: "+977 9801110011", address: "Thamel, Kathmandu", birthday: "1979-07-16", roleId: "2", roleName: "Manager", personalizedPermissions: [], status: "active" },
  { fullName: "Puja Tamang", email: "puja.tamang@mintflow.local", phone: "+977 9801110012", address: "Boudha, Kathmandu", birthday: "1998-02-02", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Nabin Thapa", email: "nabin.thapa@mintflow.local", phone: "+977 9801110013", address: "Baluwatar, Kathmandu", birthday: "1986-12-19", roleId: "1", roleName: "Super Admin", personalizedPermissions: [], status: "active" },
  { fullName: "Rekha Pandey", email: "rekha.pandey@mintflow.local", phone: "+977 9801110014", address: "Maharajgunj, Kathmandu", birthday: "1991-05-11", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "inactive" },
  { fullName: "Suresh Koirala", email: "suresh.koirala@mintflow.local", phone: "+977 9801110015", address: "Jhamsikhel, Lalitpur", birthday: "1974-10-30", roleId: "4", roleName: "Auditor", personalizedPermissions: [], status: "active" },
  { fullName: "Laxmi Bhattarai", email: "laxmi.bhattarai@mintflow.local", phone: "+977 9801110016", address: "Kalanki, Kathmandu", birthday: "1993-08-07", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Arjun Shahi", email: "arjun.shahi@mintflow.local", phone: "+977 9801110017", address: "Chabahil, Kathmandu", birthday: "1987-03-25", roleId: "2", roleName: "Manager", personalizedPermissions: [], status: "active" },
  { fullName: "Gita Subedi", email: "gita.subedi@mintflow.local", phone: "+977 9801110018", address: "Gongabu, Kathmandu", birthday: "1996-06-18", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Bikash Oli", email: "bikash.oli@mintflow.local", phone: "+977 9801110019", address: "Satdobato, Lalitpur", birthday: "1984-01-09", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "suspended" },
  { fullName: "Kamala Poudel", email: "kamala.poudel@mintflow.local", phone: "+977 9801110020", address: "Kirtipur, Kathmandu", birthday: "1982-09-04", roleId: "4", roleName: "Auditor", personalizedPermissions: [], status: "active" },
  { fullName: "Deepak Rana", email: "deepak.rana@mintflow.local", phone: "+977 9801110021", address: "New Baneshwor, Kathmandu", birthday: "1989-11-22", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Sabina Magar", email: "sabina.magar@mintflow.local", phone: "+977 9801110022", address: "Swayambhu, Kathmandu", birthday: "1997-04-15", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Hemanta Bhandari", email: "hemanta.bhandari@mintflow.local", phone: "+977 9801110023", address: "Teku, Kathmandu", birthday: "1976-07-28", roleId: "2", roleName: "Manager", personalizedPermissions: [], status: "active" },
  { fullName: "Rita Chaudhary", email: "rita.chaudhary@mintflow.local", phone: "+977 9801110024", address: "Birgunj Road, Parsa", birthday: "1994-12-01", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "inactive" },
  { fullName: "Manoj KC", email: "manoj.kc@mintflow.local", phone: "+977 9801110025", address: "Dillibazar, Kathmandu", birthday: "1981-02-17", roleId: "1", roleName: "Super Admin", personalizedPermissions: [], status: "active" },
  { fullName: "Sangita Limbu", email: "sangita.limbu@mintflow.local", phone: "+977 9801110026", address: "Dharan, Sunsari", birthday: "1999-10-10", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Yogesh Aryal", email: "yogesh.aryal@mintflow.local", phone: "+977 9801110027", address: "Pokhara Lakeside, Kaski", birthday: "1985-05-29", roleId: "4", roleName: "Auditor", personalizedPermissions: [], status: "active" },
  { fullName: "Parbati Joshi", email: "parbati.joshi@mintflow.local", phone: "+977 9801110028", address: "Butwal, Rupandehi", birthday: "1992-08-13", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Rajan Silwal", email: "rajan.silwal@mintflow.local", phone: "+977 9801110029", address: "Hetauda, Makwanpur", birthday: "1978-03-06", roleId: "2", roleName: "Manager", personalizedPermissions: [], status: "active" },
  { fullName: "Usha Nepal", email: "usha.nepal@mintflow.local", phone: "+977 9801110030", address: "Biratnagar, Morang", birthday: "1991-01-23", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "suspended" },
  { fullName: "Amit Yadav", email: "amit.yadav@mintflow.local", phone: "+977 9801110031", address: "Janakpur, Dhanusha", birthday: "1988-06-30", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Nirmala Devi", email: "nirmala.devi@mintflow.local", phone: "+977 9801110032", address: "Birgunj, Parsa", birthday: "1973-11-14", roleId: "4", roleName: "Auditor", personalizedPermissions: [], status: "active" },
  { fullName: "Sandip Khadka", email: "sandip.khadka@mintflow.local", phone: "+977 9801110033", address: "Imadol, Lalitpur", birthday: "1996-09-09", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "active" },
  { fullName: "Binu Ghimire", email: "binu.ghimire@mintflow.local", phone: "+977 9801110034", address: "Nagarjun, Kathmandu", birthday: "1990-12-26", roleId: "3", roleName: "Staff", personalizedPermissions: [], status: "inactive" },
  { fullName: "Tika Ram Bista", email: "tika.bista@mintflow.local", phone: "+977 9801110035", address: "Dhangadhi, Kailali", birthday: "1980-04-04", roleId: "2", roleName: "Manager", personalizedPermissions: [], status: "active" },
];

function buildMockAccounts(): Account[] {
  return SEED_ACCOUNTS.map((account, index) => {
    const id = String(index + 1);
    const day = String((index % 28) + 1).padStart(2, "0");
    const month = String((index % 12) + 1).padStart(2, "0");
    const createdAt = `2025-${month}-${day}T00:00:00Z`;
    return {
      ...account,
      id,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

export const MOCK_ACCOUNTS: Account[] = buildMockAccounts();

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
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
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
    email: data.email ?? "",
    phone: data.phone ?? "",
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
