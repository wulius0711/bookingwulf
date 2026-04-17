import * as Sentry from '@sentry/nextjs';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
  }
}

export async function onRequestError(
  error: unknown,
  request: { method: string; url: string; headers: Record<string, string>; path: string },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string },
) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureRequestError(error, request, context);
  }
}
