import type { ComponentType } from "react";
import type { DocumentContent, DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";

export interface WodaFormProps extends DocumentFormProps {
  /** Declarative description of the WODA variant's sections and fields. */
  schema: WodaFormSchema;
}

/**
 * A document type's form that is a `WodaForm` over a fixed schema, carrying that
 * schema so the registry can expose it (`DocumentTypeConfig.formSchema`) — the
 * prefill seeds a new document only into fields its form shows.
 */
export type SchemaFormComponent = ComponentType<DocumentFormProps> & {
  formSchema: WodaFormSchema;
};

export interface CreateSchemaFormOptions {
  /** Shown in React devtools. */
  displayName: string;
  /** Reshapes the submitted content before the editor saves it (LOR bakes its constants in). */
  transformSubmit?: (content: DocumentContent) => DocumentContent;
}
