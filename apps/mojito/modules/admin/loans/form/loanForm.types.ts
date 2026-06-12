import type { LoanStatus } from "../module.api";

export interface LoanFormValues {
  memberId: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  loanDate: string;
  dueDate: string;
  returnDate: string;
  status: LoanStatus;
  notes: string;
}
