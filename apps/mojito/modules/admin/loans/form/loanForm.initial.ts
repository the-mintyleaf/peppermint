import type { LoanFormValues } from "./loanForm.types";

export const LOAN_FORM_INITIAL: LoanFormValues = {
  memberId: "",
  memberName: "",
  bookId: "",
  bookTitle: "",
  loanDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  returnDate: "",
  status: "active",
  notes: "",
};
