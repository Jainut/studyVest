-- Restore the enum values used by the API and frontend.
BEGIN;
CREATE TYPE "ExamType_new" AS ENUM ('FUVEST', 'ENEM', 'OUTRO');
ALTER TABLE "questions" ALTER COLUMN "exam_type" TYPE "ExamType_new" USING ("exam_type"::text::"ExamType_new");
ALTER TYPE "ExamType" RENAME TO "ExamType_old";
ALTER TYPE "ExamType_new" RENAME TO "ExamType";
DROP TYPE "ExamType_old";
COMMIT;

BEGIN;
CREATE TYPE "TopicStatus_new" AS ENUM ('PENDENTE', 'ESTUDANDO', 'REVISANDO', 'DOMINADO');
ALTER TABLE "topics" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "topics" ALTER COLUMN "status" TYPE "TopicStatus_new" USING ("status"::text::"TopicStatus_new");
ALTER TYPE "TopicStatus" RENAME TO "TopicStatus_old";
ALTER TYPE "TopicStatus_new" RENAME TO "TopicStatus";
DROP TYPE "TopicStatus_old";
ALTER TABLE "topics" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
COMMIT;

-- The application records a free-form explanation for a mistake.
ALTER TABLE "mistakes" ALTER COLUMN "reason" TYPE TEXT USING ("reason"::text);
DROP TYPE "MistakeReason";
