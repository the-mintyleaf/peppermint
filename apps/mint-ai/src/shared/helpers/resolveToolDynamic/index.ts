// src/shared/helpers/resolveToolConfig.ts

/**
 * Replace placeholders like ${{fromAI(key)}} with values from args.
 * Works recursively for url, headers, query, and body.
 */
export function resolveToolConfig<T extends Record<string, any>>(
  config: T,
  args: Record<string, any>
): T {
  const replacer = (val: any): any => {
    if (typeof val === "string") {
      return val.replace(/\${{fromAI\((.*?)\)}}/g, (_, key) => {
        const cleanKey = key.trim();
        return args[cleanKey] !== undefined ? String(args[cleanKey]) : "";
      });
    }
    if (Array.isArray(val)) return val.map(replacer);
    if (val && typeof val === "object") {
      return Object.fromEntries(
        Object.entries(val).map(([k, v]) => [k, replacer(v)])
      );
    }
    return val;
  };

  return replacer(config);
}
