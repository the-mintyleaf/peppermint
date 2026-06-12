export const brandKitKeys = {
  all: ["brand-kit"] as const,
  detail: () => [...brandKitKeys.all, "detail"] as const,
};
