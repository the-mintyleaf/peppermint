import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The carried-over client calls DRF-style paths with a trailing slash
  // (`/api/v1/auth/login/`). Next's default 308-redirects every one of those to
  // the slash-less form; skipping that keeps the mock route handlers a drop-in
  // for the real backend, with no redirect hop on each auth call.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
