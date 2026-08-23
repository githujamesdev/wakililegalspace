-- Review-only migration draft. Not applied automatically per request.
-- Existing schema already contains invoices, payments, receipts, calendar events,
-- tasks, and activity logs. These additions support hearing summaries and SMS queueing.

ALTER TABLE "calendarEvent" ADD COLUMN IF NOT EXISTS "transcript" text;
ALTER TABLE "calendarEvent" ADD COLUMN IF NOT EXISTS "summary" text;
ALTER TABLE "calendarEvent" ADD COLUMN IF NOT EXISTS "summaryGeneratedAt" timestamp;

CREATE TABLE IF NOT EXISTS "notificationQueue" (
  "id" text PRIMARY KEY,
  "organizationId" text NOT NULL,
  "clientId" text,
  "caseId" text,
  "channel" varchar(20) NOT NULL,
  "recipient" varchar(255) NOT NULL,
  "template" varchar(50) NOT NULL,
  "body" text NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'queued',
  "providerMessageId" varchar(255),
  "scheduledFor" timestamp,
  "sentAt" timestamp,
  "createdBy" text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "notificationQueue_org_status_idx"
  ON "notificationQueue" ("organizationId", "status");
