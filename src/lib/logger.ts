/**
 * Centralised logger. In production, debug/info calls are suppressed.
 * Errors and warnings always reach the console so they surface in Vercel logs
 * and browser DevTools even in prod.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.error("[analytics] recordView failed:", err);
 */

const isProd = import.meta.env.PROD;

export const logger = {
  debug: (...args: unknown[]) => { if (!isProd) console.debug(...args); },
  info:  (...args: unknown[]) => { if (!isProd) console.info(...args); },
  warn:  (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};
