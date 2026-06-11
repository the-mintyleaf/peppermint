import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin/content/calendar",
        destination: "/admin/publish/calendar",
        permanent: true,
      },
      {
        source: "/admin/content/library",
        destination: "/admin/publish/library",
        permanent: true,
      },
      {
        source: "/admin/content/library/:id",
        destination: "/admin/publish/library/:id",
        permanent: true,
      },
      {
        source: "/admin/content/templates",
        destination: "/admin/automation/templates",
        permanent: true,
      },
      {
        source: "/admin/content/templates/new",
        destination: "/admin/automation/templates/new",
        permanent: true,
      },
      {
        source: "/admin/content/templates/:id/edit",
        destination: "/admin/automation/templates/:id/edit",
        permanent: true,
      },
      {
        source: "/admin/content/templates/:id/preview",
        destination: "/admin/automation/templates/:id/preview",
        permanent: true,
      },
      {
        source: "/admin/analytics/overview",
        destination: "/admin/analytics/post-analysis",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
