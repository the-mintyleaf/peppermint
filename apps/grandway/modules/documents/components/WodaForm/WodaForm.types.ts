import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";

export interface WodaFormProps extends DocumentFormProps {
  /** Declarative description of the WODA variant's sections and fields. */
  schema: WodaFormSchema;
}
