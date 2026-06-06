"use client";

import { TemplateStudentCV } from "@/components/templates/student-cv";
import { createCvTemplateAdapter } from "../../utils/createTemplateAdapter";

export const CvTemplate = createCvTemplateAdapter(TemplateStudentCV);
