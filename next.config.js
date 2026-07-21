const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// Sentry cuma aktif kalau NEXT_PUBLIC_SENTRY_DSN diisi di env — tanpa DSN,
// wrapper ini basically no-op, jadi aman kalaupun kamu belum bikin project
// Sentry-nya. Lihat SENTRY_SETUP.md buat cara ngisi DSN-nya.
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      widenClientFileUpload: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig;
