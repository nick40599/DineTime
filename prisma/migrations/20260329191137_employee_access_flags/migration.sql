/*
  Warnings:

  - Added the required column `hourlyRate` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "adminAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "barMenuAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hourlyClockAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hourlyRate" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "hoursWorked" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "serverMenuAccess" BOOLEAN NOT NULL DEFAULT false;
