"use client";

import type { ComponentType, ReactNode } from "react";
import type { DocumentTemplateProps } from "../documents.types";
import { TemplateRenderProvider, type TemplateContentShape } from "../components/TemplateRenderProvider";
import { A4Page } from "../components/A4Page";

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
    const content = (props.historicalSnapshot?.content ?? props.document.content) as Record<
      string,
      unknown
    > & {
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
        selectedInstructor={content.instructorId ? String(content.instructorId) : null}
        selectedDirector={content.directorId ? String(content.directorId) : null}
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
      full_name: student?.fullName ?? (content as Record<string, unknown>).full_name,
      email: student?.email ?? (content as Record<string, unknown>).email,
      contact: student?.phone ?? (content as Record<string, unknown>).contact,
      current_address: (content as Record<string, unknown>).current_address ?? student?.nationality,
      batch_detail: {
        course: student?.program,
        name: student?.fullName,
      },
    };

    return <Component data={data} />;
  };
}

export function TemplateStack({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>;
}
