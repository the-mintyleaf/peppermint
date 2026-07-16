"use client";

import type { ComponentType, ReactNode } from "react";
import type {
  BankCertificateContent,
  BankStatementContent,
  DocumentTemplateProps,
} from "../documents.types";
import {
  TemplateRenderProvider,
  type TemplateContentShape,
} from "../components/TemplateRenderProvider";
import { A4Page } from "../components/A4Page";
import { computeBankStatement } from "./bankStatement";
import { currencyInWords } from "./numberToWords";

export function createTemplateAdapter(
  Component: ComponentType,
  options?: { wrapA4?: boolean },
) {
  const wrapA4 = options?.wrapA4 ?? false;

  function AdaptedTemplate(props: DocumentTemplateProps) {
    const content = (props.historicalSnapshot?.content ??
      props.document.content) as TemplateContentShape;

    const inner = (
      <div data-print-page style={{ width: "210mm", margin: "0 auto" }}>
        <TemplateRenderProvider content={content}>
          <Component />
        </TemplateRenderProvider>
      </div>
    );

    if (wrapA4) {
      return <A4Page>{inner}</A4Page>;
    }

    return inner;
  }

  return AdaptedTemplate;
}

/**
 * Adapter for `bank-*-statement` templates. Runs `computeBankStatement` and injects the
 * derived rows/totals into the content (both at top level → `form.values`, and mirrored
 * into `details` → ContextEditor state) under the exact legacy field names the templates
 * read, so existing statement markup renders correctly without any change.
 */
export function createBankStatementTemplateAdapter(
  Component: ComponentType,
  options?: { wrapA4?: boolean },
) {
  const wrapA4 = options?.wrapA4 ?? false;

  function BankStatementAdaptedTemplate(props: DocumentTemplateProps) {
    const raw = (props.historicalSnapshot?.content ??
      props.document.content) as BankStatementContent;
    const computed = computeBankStatement(raw);

    const content = {
      ...raw,
      ...computed,
      details: {
        ...(raw.details ?? {}),
        statement_interest: raw.statement_interest,
        statements_opening_bal: computed.statements_opening_bal,
        statements_opening_date: computed.statements_opening_date,
        statements: computed.workedStatements,
      },
    } as TemplateContentShape;

    const inner = (
      <div data-print-page style={{ width: "210mm", margin: "0 auto" }}>
        <TemplateRenderProvider content={content}>
          <Component />
        </TemplateRenderProvider>
      </div>
    );

    if (wrapA4) {
      return <A4Page>{inner}</A4Page>;
    }

    return inner;
  }

  return BankStatementAdaptedTemplate;
}

/**
 * Adapter for `bank-*-certificate` templates. Derives the balance-in-words fields
 * (NPR and USD) and mirrors the numeric balance so the template's inline USD math works,
 * then renders the existing certificate markup unchanged.
 */
export function createBankCertificateTemplateAdapter(
  Component: ComponentType,
  options?: { wrapA4?: boolean },
) {
  const wrapA4 = options?.wrapA4 ?? false;

  function BankCertificateAdaptedTemplate(props: DocumentTemplateProps) {
    const raw = (props.historicalSnapshot?.content ??
      props.document.content) as BankCertificateContent;

    const balance = Number(raw.statement_total_balance ?? 0) || 0;
    const usdRate = Number(raw.statement_usdrate ?? 0) || 0;
    const usdAmount = usdRate > 0 ? balance / usdRate : 0;

    const content = {
      ...raw,
      statement_total_balance: balance,
      statement_balance_total_number: balance,
      statement_usdrate: usdRate,
      statement_total_balance_words: currencyInWords(balance),
      statement_total_balance_words_usd: currencyInWords(
        usdAmount,
        "US Dollars",
        "Cents",
      ),
    } as TemplateContentShape;

    const inner = (
      <div data-print-page style={{ width: "210mm", margin: "0 auto" }}>
        <TemplateRenderProvider content={content}>
          <Component />
        </TemplateRenderProvider>
      </div>
    );

    if (wrapA4) {
      return <A4Page>{inner}</A4Page>;
    }

    return inner;
  }

  return BankCertificateAdaptedTemplate;
}

export function createCertificateTemplateAdapter(
  Component: ComponentType<{
    selectedInstructor: string | null;
    selectedDirector: string | null;
    signatures: Array<{
      id: string;
      name: string;
      role?: string;
      jp_role?: string;
      signature_image: string;
    }>;
    overrideData?: Record<string, unknown>;
  }>,
) {
  return function CertificateAdaptedTemplate(props: DocumentTemplateProps) {
    const content = (props.historicalSnapshot?.content ??
      props.document.content) as Record<string, unknown> & {
      instructorId?: string | null;
      directorId?: string | null;
    };

    const signatures = (props.signatures ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      signature_image: s.signature_image,
      role: undefined,
      jp_role: undefined,
    }));

    return (
      <Component
        selectedInstructor={
          content.instructorId ? String(content.instructorId) : null
        }
        selectedDirector={
          content.directorId ? String(content.directorId) : null
        }
        signatures={signatures}
        overrideData={content}
      />
    );
  };
}

export function createCvTemplateAdapter(
  Component: ComponentType<{ data?: Record<string, unknown> }>,
) {
  return function CvAdaptedTemplate(props: DocumentTemplateProps) {
    const content = props.historicalSnapshot?.content ?? props.document.content;
    const student = props.studentFullData;

    const data = {
      ...(content as Record<string, unknown>),
      full_name:
        student?.fullName ?? (content as Record<string, unknown>).full_name,
      email: student?.email ?? (content as Record<string, unknown>).email,
      contact: student?.phone ?? (content as Record<string, unknown>).contact,
      current_address:
        (content as Record<string, unknown>).current_address ??
        student?.nationality,
      batch_detail: {
        course: student?.program,
        name: student?.fullName,
      },
    };

    return <Component data={data} />;
  };
}

export function TemplateStack({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {children}
    </div>
  );
}
