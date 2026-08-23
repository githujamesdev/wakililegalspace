-- Review-only migration. Apply through Neon MCP after approval.
ALTER TABLE "case" ADD COLUMN IF NOT EXISTS "agreedFee" integer NOT NULL DEFAULT 0;
ALTER TABLE "case" ALTER COLUMN "caseType" TYPE varchar(100);

-- Existing invoice, payment, and receipt tables are used for billing history.
-- Payment amounts are stored in cents; the UI displays KES.
