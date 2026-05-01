import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const baseHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      // All routes get base headers
      { source: '/(.*)', headers: baseHeaders },
      // Only admin pages get X-Frame-Options — widget HTML files must stay embeddable
      { source: '/admin/:path*', headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }] },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "",
  project: process.env.SENTRY_PROJECT || "",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
});
