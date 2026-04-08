-- CreateTable
CREATE TABLE "persons" (
    "person_id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(101) NOT NULL,
    "site_id" VARCHAR(11) NOT NULL,
    "has_training" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "trainers" (
    "trainer_id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(101) NOT NULL,
    "location_id" VARCHAR(11) NOT NULL,
    "person_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("trainer_id")
);

-- CreateIndex
CREATE INDEX "persons_first_name_last_name_site_id_idx" ON "persons"("first_name", "last_name", "site_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_person_id_key" ON "trainers"("person_id");

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("plant_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "sites"("plant_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;
