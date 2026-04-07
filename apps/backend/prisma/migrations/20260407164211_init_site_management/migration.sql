-- CreateTable
CREATE TABLE "HealthCheck" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "plant_no" VARCHAR(11) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "address_line_1" VARCHAR(50),
    "address_line_2" VARCHAR(50),
    "address_town" VARCHAR(50),
    "address_county" VARCHAR(50),
    "address_post_code" VARCHAR(50),
    "telephone" VARCHAR(50),
    "fax" VARCHAR(50),
    "is_apha_site" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("plant_no")
);

-- CreateIndex
CREATE UNIQUE INDEX "sites_name_key" ON "sites"("name");

-- CreateIndex
CREATE INDEX "sites_name_idx" ON "sites"("name");
