"use client";

import {
  DocumentContextProvider,
  type StudentCertificateData,
} from "@/context/DocumentContext";
import { TemplateStudentCertificate } from "@/components/templates/student-certificate";
import type {
  DocumentTemplateProps,
  CertificateContent,
} from "../../documents.types";

export function CertificateTemplate(props: DocumentTemplateProps) {
  const content = (props.historicalSnapshot?.content ??
    props.document.content) as CertificateContent;
  // Same precedence as the CV adapter: a URL stored on the document overrides,
  // otherwise the applicant's photograph fills the portrait box.
  const certData = {
    ...content,
    image: content.image || props.studentFullData?.photoUrl || "",
  } as StudentCertificateData;
  const signatures = (props.signatures ?? []).map((sig) => ({
    id: sig.id,
    name: sig.name,
    signature_image: sig.signature_image,
  }));

  return (
    <DocumentContextProvider documentData={certData}>
      <TemplateStudentCertificate
        selectedInstructor={
          content.instructorId ? String(content.instructorId) : null
        }
        selectedDirector={
          content.directorId ? String(content.directorId) : null
        }
        signatures={signatures}
        overrideData={certData}
      />
    </DocumentContextProvider>
  );
}
