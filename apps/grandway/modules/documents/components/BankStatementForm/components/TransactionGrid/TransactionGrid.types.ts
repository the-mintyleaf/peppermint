import type { UseFormReturnType } from "@peppermint/ui";
import type { BankStatementContent } from "../../../../documents.types";
import type { ComputedBankStatement } from "../../../../utils/bankStatement";

export interface TransactionGridProps {
  /** The statement form instance — the grid edits `transactions` in place. */
  form: UseFormReturnType<BankStatementContent>;
  /** Derived rows/totals from `computeBankStatement` — drives every read-only cell. */
  computed: ComputedBankStatement;
  /** Appends a normal row; called when Enter is pressed on the last row. */
  onAddRow: () => void;
  isLoading?: boolean;
}
