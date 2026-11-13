-- Add Better Auth Admin Plugin columns
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_reason" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_expires" timestamp;

ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "impersonated_by" text;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "user" ("role");
CREATE INDEX IF NOT EXISTS "session_impersonated_by_idx" ON "session" ("impersonated_by");