import { z } from "zod";

export const identitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameNepali: z.string().min(1, "Nepali name is required"),
  code: z.string().min(1, "Code is required").max(20, "Code must be 20 characters or less"),
  unitType: z.enum(
    ["ministry", "department", "division", "section", "district_office", "area_office", "security_agency", "other"],
    { error: "Unit type is required" },
  ),
  description: z.string(),
});

export const locationSchema = z.object({
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  municipality: z.string(),
  ward: z.string(),
  address: z.string(),
});

export const contactSchema = z.object({
  phone: z.string(),
  email: z.string().refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email address"),
  fax: z.string(),
  website: z.string(),
  headName: z.string(),
  headTitle: z.string(),
  headPhone: z.string(),
  headEmail: z.string().refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email address"),
});

export const settingsSchema = z.object({
  parentId: z.string(),
  taskVisibility: z.enum(["all_members", "direct_members", "head_only"]),
  confidentialityLevel: z.enum(["public", "restricted", "confidential", "top_secret"]),
  status: z.enum(["active", "inactive", "archived"]),
});

export const ORG_UNIT_STEP_FIELDS: string[][] = [
  ["name", "nameNepali", "code", "unitType", "description"],
  ["province", "district", "municipality", "ward", "address"],
  ["phone", "email", "fax", "website", "headName", "headTitle", "headPhone", "headEmail"],
  ["parentId", "taskVisibility", "confidentialityLevel", "status"],
];
