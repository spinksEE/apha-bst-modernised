-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('Trained', 'CascadeTrained', 'TrainingConfirmed');

-- CreateEnum
CREATE TYPE "Species" AS ENUM ('Cattle', 'Sheep', 'Goat');

-- CreateTable
CREATE TABLE "trainings" (
    "training_id" SERIAL NOT NULL,
    "trainee_id" INTEGER NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "date_trained" DATE NOT NULL,
    "species_trained" "Species"[],
    "training_type" "TrainingType" NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT DEFAULT 'system',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT DEFAULT 'system',
    "modified_at" TIMESTAMP(3) NOT NULL,
    "deleted_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("training_id")
);

-- CreateIndex
CREATE INDEX "trainings_trainee_id_idx" ON "trainings"("trainee_id");

-- CreateIndex
CREATE INDEX "trainings_trainer_id_idx" ON "trainings"("trainer_id");

-- CreateIndex
CREATE INDEX "trainings_date_trained_idx" ON "trainings"("date_trained");

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_trainee_id_fkey" FOREIGN KEY ("trainee_id") REFERENCES "persons"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("trainer_id") ON DELETE RESTRICT ON UPDATE CASCADE;
