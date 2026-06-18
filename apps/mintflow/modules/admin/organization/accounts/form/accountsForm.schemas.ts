import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  address: z.string().min(1, "Address is required"),
  birthday: z.string().min(1, "Birthday is required"),
  status: z.string().min(1, "Status is required"),
});

export const rolePermissionsSchema = z.object({
  roleId: z.string().min(1, "A role must be assigned"),
  personalizedPermissions: z.array(z.any()),
});

export const ACCOUNTS_STEP_FIELDS: string[][] = [
  ["fullName", "address", "birthday", "status"],
  ["roleId", "personalizedPermissions"],
];
