import { z } from "zod";

export const loanDetailsSchema = z.object({
  memberId:   z.string().min(1, "Member is required"),
  memberName: z.string().min(1, "Required"),
  bookId:     z.string().min(1, "Book is required"),
  bookTitle:  z.string().min(1, "Required"),
});

export const loanDatesSchema = z.object({
  loanDate: z.string().min(1, "Loan date is required"),
  dueDate:  z.string().min(1, "Due date is required"),
  status:   z.enum(["active", "overdue", "returned"]),
  notes:    z.string(),
});

export const LOAN_STEP_FIELDS: string[][] = [
  ["memberId", "memberName", "bookId", "bookTitle"],
  ["loanDate", "dueDate", "status", "notes"],
];
