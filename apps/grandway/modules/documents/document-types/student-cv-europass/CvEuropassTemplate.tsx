"use client";

import { TemplateStudentCVEuropass } from "@/components/templates/student-cv-europass";
import { createCvTemplateAdapter } from "../../utils/createTemplateAdapter";

export const CvEuropassTemplate = createCvTemplateAdapter(
  TemplateStudentCVEuropass,
);
