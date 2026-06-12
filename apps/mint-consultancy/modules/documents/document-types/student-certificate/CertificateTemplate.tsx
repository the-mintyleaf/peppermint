"use client";

import { TemplateStudentCertificate } from "@/components/templates/student-certificate";
import { DocumentContextProvider } from "@/context/DocumentContext";
import type { DocumentTemplateProps, CertificateContent } from "../../documents.types";

export function CertificateTemplate(props: DocumentTemplateProps) {
  const content = (props.historicalSnapshot?.content ?? props.document.content) as CertificateContent;
  const signatures = (props.signatures ?? []).map((sig) => ({
    id: sig.id,
    name: sig.name,
    signature_image: sig.signature_image,
  }));

  return (
    <DocumentContextProvider documentData={content}>
      <TemplateStudentCertificate
        selectedInstructor={content.instructorId ? String(content.instructorId) : null}
        selectedDirector={content.directorId ? String(content.directorId) : null}
        signatures={signatures}
        overrideData={content}
      />
    </DocumentContextProvider>
  );
}
