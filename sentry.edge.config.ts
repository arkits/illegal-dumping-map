import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://12e96e1fb54d84a9e6c753d10bf12cb2@o425745.ingest.us.sentry.io/4510733163757568",

  enableLogs: true,

  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
