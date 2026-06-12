export const linkInBioKeys = {
  all: ["link-in-bio"] as const,
  page: () => [...linkInBioKeys.all, "page"] as const,
};
