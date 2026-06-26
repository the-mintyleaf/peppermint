import type { QueryParams } from "@peppermint/admin";

export type LoanStatus = "active" | "overdue" | "returned";

export interface LoanEvent {
  id: string;
  timestamp: string;
  event: string;
  note?: string;
}

export interface Loan extends Record<string, unknown> {
  id: string;
  memberId: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  notes: string;
  timeline: LoanEvent[];
}

export interface LoansResponse {
  data: Loan[];
  meta: { total: number; page: number; pageSize: number };
}

const MOCK_LOANS: Loan[] = [
  {
    id: "1",
    memberId: "1",
    memberName: "Alice Johnson",
    bookId: "2",
    bookTitle: "To Kill a Mockingbird",
    loanDate: "2026-05-01",
    dueDate: "2026-05-15",
    returnDate: null,
    status: "overdue",
    notes: "Requested extension once.",
    timeline: [
      { id: "e1", timestamp: "2026-05-01T10:00:00Z", event: "Loan created" },
      {
        id: "e2",
        timestamp: "2026-05-10T09:30:00Z",
        event: "Extension requested",
      },
    ],
  },
  {
    id: "2",
    memberId: "2",
    memberName: "Bob Smith",
    bookId: "1",
    bookTitle: "The Great Gatsby",
    loanDate: "2026-06-01",
    dueDate: "2026-06-20",
    returnDate: null,
    status: "active",
    notes: "",
    timeline: [
      { id: "e3", timestamp: "2026-06-01T11:00:00Z", event: "Loan created" },
    ],
  },
];

export async function fetchLoans(params?: QueryParams): Promise<LoansResponse> {
  let data = [...MOCK_LOANS];
  if (params?.filters?.status) {
    data = data.filter((l) => l.status === params.filters!.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (l) =>
        l.memberName.toLowerCase().includes(q) ||
        l.bookTitle.toLowerCase().includes(q),
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

export async function fetchLoan(id: string): Promise<Loan> {
  const loan = MOCK_LOANS.find((l) => l.id === id);
  if (!loan) throw new Error("Loan not found");
  return loan;
}

export async function createLoan(data: Partial<Loan>): Promise<Loan> {
  return {
    ...data,
    id: String(Date.now()),
    timeline: [
      {
        id: String(Date.now()),
        timestamp: new Date().toISOString(),
        event: "Loan created",
      },
    ],
  } as Loan;
}

export async function updateLoan(
  id: string,
  data: Partial<Loan>,
): Promise<Loan> {
  return { ...data, id } as Loan;
}

export async function deleteLoan(id: string): Promise<void> {
  void id;
}
