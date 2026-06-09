"use client";

import { TemplateStudentCVStandard } from "@/components/templates/student-cv-standard";
import { createCvTemplateAdapter } from "../../utils/createTemplateAdapter";

export const CvStandardTemplate = createCvTemplateAdapter(TemplateStudentCVStandard);
