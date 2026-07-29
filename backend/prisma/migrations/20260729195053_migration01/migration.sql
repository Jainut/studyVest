/*
  Warnings:

  - The values [OUTRO] on the enum `ExamType` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDENTE] on the enum `TopicStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `essays` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `comp1` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `comp2` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `comp3` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `comp4` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `comp5` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `essays` table. All the data in the column will be lost.
  - The `id` column on the `essays` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `goals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deadline` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `goals` table. All the data in the column will be lost.
  - The `id` column on the `goals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `mistakes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `mistakes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `questions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `questions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `reviews` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `schedules` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `notes` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `schedules` table. All the data in the column will be lost.
  - The `id` column on the `schedules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `topic_id` column on the `schedules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `study_sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `study_sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `topic_id` column on the `study_sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `subjects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `subjects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `topics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `enem_importance` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `fuvest_importance` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `topics` table. All the data in the column will be lost.
  - The `id` column on the `topics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `user_id` on the `essays` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `goals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `mistakes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `question_id` on the `mistakes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `reason` on the `mistakes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `questions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `topic_id` on the `questions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `reviews` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `topic_id` on the `reviews` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `schedules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `subject_id` on the `schedules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `study_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `subject_id` on the `study_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `subjects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `topics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `subject_id` on the `topics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MistakeReason" AS ENUM ('FALTA_ATENCAO', 'FALTA_CONHECIMENTO', 'INTERPRETACAO', 'CALCULO');

-- AlterEnum
BEGIN;
CREATE TYPE "ExamType_new" AS ENUM ('FUVEST', 'ENEM', 'OUTROS');
ALTER TABLE "questions" ALTER COLUMN "exam_type" TYPE "ExamType_new" USING ("exam_type"::text::"ExamType_new");
ALTER TYPE "ExamType" RENAME TO "ExamType_old";
ALTER TYPE "ExamType_new" RENAME TO "ExamType";
DROP TYPE "public"."ExamType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TopicStatus_new" AS ENUM ('NAO_INICIADO', 'ESTUDANDO', 'REVISANDO', 'DOMINADO');
ALTER TABLE "public"."topics" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "topics" ALTER COLUMN "status" TYPE "TopicStatus_new" USING ("status"::text::"TopicStatus_new");
ALTER TYPE "TopicStatus" RENAME TO "TopicStatus_old";
ALTER TYPE "TopicStatus_new" RENAME TO "TopicStatus";
DROP TYPE "public"."TopicStatus_old";
ALTER TABLE "topics" ALTER COLUMN "status" SET DEFAULT 'NAO_INICIADO';
COMMIT;

-- DropForeignKey
ALTER TABLE "essays" DROP CONSTRAINT "essays_user_id_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_user_id_fkey";

-- DropForeignKey
ALTER TABLE "mistakes" DROP CONSTRAINT "mistakes_question_id_fkey";

-- DropForeignKey
ALTER TABLE "mistakes" DROP CONSTRAINT "mistakes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_user_id_fkey";

-- DropForeignKey
ALTER TABLE "study_sessions" DROP CONSTRAINT "study_sessions_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "study_sessions" DROP CONSTRAINT "study_sessions_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "study_sessions" DROP CONSTRAINT "study_sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_user_id_fkey";

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_user_id_fkey";

-- DropIndex
DROP INDEX "essays_user_id_date_idx";

-- DropIndex
DROP INDEX "goals_user_id_status_idx";

-- DropIndex
DROP INDEX "questions_user_id_created_at_idx";

-- DropIndex
DROP INDEX "reviews_topic_id_idx";

-- DropIndex
DROP INDEX "reviews_user_id_status_due_date_idx";

-- DropIndex
DROP INDEX "schedules_user_id_date_idx";

-- DropIndex
DROP INDEX "study_sessions_user_id_date_idx";

-- DropIndex
DROP INDEX "topics_user_id_priority_idx";

-- DropIndex
DROP INDEX "topics_user_id_status_idx";

-- DropIndex
DROP INDEX "topics_user_id_subject_id_name_key";

-- AlterTable
ALTER TABLE "essays" DROP CONSTRAINT "essays_pkey",
DROP COLUMN "comp1",
DROP COLUMN "comp2",
DROP COLUMN "comp3",
DROP COLUMN "comp4",
DROP COLUMN "comp5",
DROP COLUMN "updated_at",
ADD COLUMN     "comp_1" INTEGER,
ADD COLUMN     "comp_2" INTEGER,
ADD COLUMN     "comp_3" INTEGER,
ADD COLUMN     "comp_4" INTEGER,
ADD COLUMN     "comp_5" INTEGER,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "essays_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "goals" DROP CONSTRAINT "goals_pkey",
DROP COLUMN "deadline",
DROP COLUMN "status",
DROP COLUMN "type",
DROP COLUMN "updated_at",
ADD COLUMN     "target_date" TIMESTAMPTZ(6),
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "target_value" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "goals_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "mistakes" DROP CONSTRAINT "mistakes_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "question_id",
ADD COLUMN     "question_id" UUID NOT NULL,
DROP COLUMN "reason",
ADD COLUMN     "reason" "MistakeReason" NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "mistakes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "questions" DROP CONSTRAINT "questions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "topic_id",
ADD COLUMN     "topic_id" UUID NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "topic_id",
ADD COLUMN     "topic_id" UUID NOT NULL,
ALTER COLUMN "due_date" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "completed_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_pkey",
DROP COLUMN "notes",
DROP COLUMN "updated_at",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "subject_id",
ADD COLUMN     "subject_id" UUID NOT NULL,
DROP COLUMN "topic_id",
ADD COLUMN     "topic_id" UUID,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "study_sessions" DROP CONSTRAINT "study_sessions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "subject_id",
ADD COLUMN     "subject_id" UUID NOT NULL,
DROP COLUMN "topic_id",
ADD COLUMN     "topic_id" UUID,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "color" DROP NOT NULL,
ALTER COLUMN "color" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "topics" DROP CONSTRAINT "topics_pkey",
DROP COLUMN "enem_importance",
DROP COLUMN "fuvest_importance",
DROP COLUMN "parent_id",
ADD COLUMN     "importance_enem" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "importance_fuvest" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parent_topic_id" UUID,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "subject_id",
ADD COLUMN     "subject_id" UUID NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'NAO_INICIADO',
ALTER COLUMN "study_date" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "next_review_date" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "daily_goal_min" SET DEFAULT 360,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "GoalStatus";

-- DropEnum
DROP TYPE "GoalType";

-- CreateIndex
CREATE INDEX "essays_date_idx" ON "essays"("date");

-- CreateIndex
CREATE INDEX "essays_user_id_idx" ON "essays"("user_id");

-- CreateIndex
CREATE INDEX "goals_user_id_idx" ON "goals"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mistakes_question_id_key" ON "mistakes"("question_id");

-- CreateIndex
CREATE INDEX "mistakes_user_id_idx" ON "mistakes"("user_id");

-- CreateIndex
CREATE INDEX "mistakes_reason_idx" ON "mistakes"("reason");

-- CreateIndex
CREATE INDEX "questions_topic_id_idx" ON "questions"("topic_id");

-- CreateIndex
CREATE INDEX "questions_exam_type_idx" ON "questions"("exam_type");

-- CreateIndex
CREATE INDEX "questions_is_correct_idx" ON "questions"("is_correct");

-- CreateIndex
CREATE INDEX "questions_user_id_idx" ON "questions"("user_id");

-- CreateIndex
CREATE INDEX "reviews_due_date_idx" ON "reviews"("due_date");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "schedules_date_idx" ON "schedules"("date");

-- CreateIndex
CREATE INDEX "schedules_user_id_idx" ON "schedules"("user_id");

-- CreateIndex
CREATE INDEX "study_sessions_subject_id_idx" ON "study_sessions"("subject_id");

-- CreateIndex
CREATE INDEX "study_sessions_date_idx" ON "study_sessions"("date");

-- CreateIndex
CREATE INDEX "study_sessions_user_id_idx" ON "study_sessions"("user_id");

-- CreateIndex
CREATE INDEX "subjects_user_id_idx" ON "subjects"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_user_name_unique" ON "subjects"("user_id", "name");

-- CreateIndex
CREATE INDEX "topics_subject_id_idx" ON "topics"("subject_id");

-- CreateIndex
CREATE INDEX "topics_next_review_date_idx" ON "topics"("next_review_date");

-- CreateIndex
CREATE INDEX "topics_status_idx" ON "topics"("status");

-- CreateIndex
CREATE INDEX "topics_user_id_idx" ON "topics"("user_id");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_topic_id_fkey" FOREIGN KEY ("parent_topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "essays" ADD CONSTRAINT "essays_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
