import type { AccountFormValues } from "./accountsForm.types";

export const ACCOUNTS_FORM_INITIAL: AccountFormValues = {
  fullName: "",
  address: "",
  birthday: "",
  roleId: "",
  personalizedPermissions: [],
  status: "active",
};
