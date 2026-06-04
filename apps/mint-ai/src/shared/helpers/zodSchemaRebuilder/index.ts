import { z, ZodType } from "zod";

export type PropZodSchemaRebuilder = {
  type: "object";
  properties?: Record<
    string,
    { type: "string" | "number" | "boolean"; description?: string }
  >;
  required?: string[];
};

/**
 * Converts a JSON-safe schema descriptor into a Zod object schema.
 * - If no properties are defined → returns z.object({})
 * - If properties are provided → builds correct zod shape
 */
export function zodSchemaRebuilder(desc: PropZodSchemaRebuilder): ZodType<any> {
  if (!desc || desc.type !== "object") {
    return z.any();
  }

  const props = desc.properties ?? {};
  if (Object.keys(props).length === 0) {
    return z.object({});
  }

  const shape: Record<string, ZodType<any>> = {};

  for (const [key, def] of Object.entries(props)) {
    let field: ZodType<any>;
    switch (def.type) {
      case "string":
        field = z.string();
        break;
      case "number":
        field = z.number();
        break;
      case "boolean":
        field = z.boolean();
        break;
      default:
        field = z.any();
    }
    if (def.description) {
      field = field.describe(def.description);
    }
    if (desc.required?.includes(key)) {
      shape[key] = field;
    } else {
      shape[key] = field.optional();
    }
  }

  return z.object(shape);
}
