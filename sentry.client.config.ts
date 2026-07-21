import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  // Session replay cuma nyala kalo ada error — biar gak makan kuota gratis
  // Sentry buat traffic normal, tapi tetep dapet rekaman pas ada bug.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  integrations: [Sentry.replayIntegration()],
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
