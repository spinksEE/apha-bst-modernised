-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('Supervisor', 'DataEntry', 'ReadOnly');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('Login', 'Logout', 'LoginFailed', 'AccessDenied', 'ScreenAccess');

-- CreateTable
CREATE TABLE "HealthCheck" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APHALocation" (
    "id" SERIAL NOT NULL,
    "locationName" TEXT NOT NULL,
    "isAHVLA" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "APHALocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "userLevel" "UserLevel" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" "AuditEventType" NOT NULL,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "sessionId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataEntryPermission" (
    "id" SERIAL NOT NULL,
    "screenName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "canWrite" BOOLEAN NOT NULL,

    CONSTRAINT "DataEntryPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "DataEntryPermission_screenName_userId_key" ON "DataEntryPermission"("screenName", "userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "APHALocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataEntryPermission" ADD CONSTRAINT "DataEntryPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
