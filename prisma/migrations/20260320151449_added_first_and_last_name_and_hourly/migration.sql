/*
  Warnings:

  - Added the required column `firstName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hourlyRate` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;
