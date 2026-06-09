"use client";

import { TemplateStudentCVExtended } from "@/components/templates/student-cv-extended";
import { createCvTemplateAdapter } from "../../utils/createTemplateAdapter";

export const CvExtendedTemplate = createCvTemplateAdapter(TemplateStudentCVExtended);
