import type { AdminShellSearchResult } from "@peppermint/admin";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { SignatureIcon } from "@phosphor-icons/react/dist/csr/Signature";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { STATUS_LABELS as APPLICANT_STATUS_LABELS } from "../applicants/applicants.labels";
import { STAGE_LABELS } from "../lead-management/leadCategory.utils";
import { TEMPLATE_STATUS_LABELS } from "../checklists/checklists.labels";
import { STATUS_META as DOCUMENT_STATUS_META } from "@/modules/documents/documents.status";
import {
  searchApplicants,
  searchChecklistTemplates,
  searchClients,
  searchDocuments,
  searchInstitutions,
  searchLeads,
  searchPrograms,
  searchSignatories,
} from "./globalSearch.api";
import type { GlobalSearchSource } from "./globalSearch.types";

/** Clients has no shared label map — its two statuses are declared per surface. */
const CLIENT_STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
} as const;

/**
 * Where a result lands when its domain has no detail route. The list page reads
 * `?q=` and prefills its own search box, so the record is one row away instead
 * of one retyped query away (`useListQueryParam`).
 */
function listHref(path: string, query: string): string {
  return `${path}?q=${encodeURIComponent(query)}`;
}

/**
 * The searchable backends, in the order their groups appear in the spotlight —
 * the applicant lifecycle first (who you are looking for), reference data after
 * (what you are looking up).
 *
 * Every `run` returns already-ranked rows: the backends relevance-rank
 * `?search=`/`?q=` themselves, and nothing here re-sorts them.
 */
export const GLOBAL_SEARCH_SOURCES: GlobalSearchSource[] = [
  {
    group: "Applicants",
    enabled: (access) => access.applicants,
    run: async (query, limit, signal) => {
      const rows = await searchApplicants(query, limit, signal);
      return rows.map<AdminShellSearchResult>((row) => ({
        id: row.id,
        group: "Applicants",
        label: row.full_name.trim() || "Unnamed applicant",
        description: row.email || undefined,
        hint: APPLICANT_STATUS_LABELS[row.status],
        icon: UsersThreeIcon,
        href: `/admin/applicants/${row.id}`,
      }));
    },
  },
  {
    group: "Leads",
    enabled: (access) => access.leads,
    run: async (query, limit, signal) => {
      const rows = await searchLeads(query, limit, signal);
      return rows.map<AdminShellSearchResult>((row) => {
        const name = row.full_name?.trim() || "Unnamed lead";
        return {
          id: row.id,
          group: "Leads",
          label: name,
          description: row.email || undefined,
          hint: STAGE_LABELS[row.stage],
          icon: AddressBookIcon,
          // Leads open in an in-page drawer, not on a route of their own.
          href: listHref("/admin/lead-management", name),
        };
      });
    },
  },
  {
    group: "Clients",
    enabled: (access) => access.clients,
    run: async (query, limit, signal) => {
      const rows = await searchClients(query, limit, signal);
      return rows.map<AdminShellSearchResult>((row) => ({
        id: row.id,
        group: "Clients",
        label: row.name,
        description: row.spokesperson_name || undefined,
        hint: CLIENT_STATUS_LABELS[row.status],
        icon: HandshakeIcon,
        href: listHref("/admin/clients", row.name),
      }));
    },
  },
  {
    group: "Documents",
    enabled: (access) => access.documents,
    run: async (query, limit, signal) => {
      const rows = await searchDocuments(query, limit, signal);
      return rows.map<AdminShellSearchResult>((row) => ({
        id: row.id,
        group: "Documents",
        label: row.label,
        description: row.applicant_name ?? "Standalone document",
        hint: DOCUMENT_STATUS_META[row.status].label,
        icon: FileTextIcon,
        // A standalone document has its own editor route; an applicant's
        // document only exists inside that applicant's workspace.
        href:
          row.is_standalone || !row.applicant
            ? `/documents/standalone/${row.id}`
            : `/documents/workspace/${row.applicant}`,
      }));
    },
  },
  {
    group: "Programs",
    enabled: (access) => access.catalogue,
    run: async (query, limit, signal) => {
      const rows = await searchPrograms(query, limit, signal);
      return rows.map<AdminShellSearchResult>((row) => ({
        id: row.id,
        group: "Programs",
        label: row.title,
        description: `${row.institution.name} · ${row.country.name}`,
        icon: GraduationCapIcon,
        href: listHref("/admin/institutions", row.title),
      }));
    },
  },
  {
    group: "Institutions",
    enabled: (access) => access.catalogue,
    run: async (query, limit, signal) => {
      const rows = await searchInstitutions(query, limit, signal);
      return rows.map<AdminShellSearchResult>((row) => ({
        id: row.id,
        group: "Institutions",
        label: row.name,
        description: [row.common_name, row.country.name]
          .filter(Boolean)
          .join(" · "),
        icon: BuildingsIcon,
        href: listHref("/admin/institutions/providers", row.name),
      }));
    },
  },
  {
    group: "Checklist templates",
    enabled: (access) => access.checklists,
    run: async (query, limit, signal) => {
      const rows = await searchChecklistTemplates(query, limit, signal);
      return rows.map<AdminShellSearchResult>((row) => ({
        id: row.id,
        group: "Checklist templates",
        label: row.label,
        description: row.country ? row.country.name : "Global template",
        hint: TEMPLATE_STATUS_LABELS[row.status],
        icon: ListChecksIcon,
        href: `/admin/checklists/templates/${row.id}`,
      }));
    },
  },
  {
    group: "Signatories",
    enabled: (access) => access.documents,
    run: async (query, limit, signal) => {
      const rows = await searchSignatories(query, limit, signal);
      return rows.map<AdminShellSearchResult>((row) => ({
        id: row.id,
        group: "Signatories",
        label: row.name,
        description: row.title || undefined,
        hint: "Certificate signatory",
        icon: SignatureIcon,
        // Signatories are authored in the backend and only ever *used* here —
        // the app has no signatory screen, so a hit lands on the surface that
        // consumes them (the certificate signatory picker lives in Documents).
        href: "/admin/documents",
      }));
    },
  },
];
