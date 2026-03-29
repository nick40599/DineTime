/*
  Warnings:

  - You are about to drop the column `hourlyRate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `hoursWorked` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Employee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shop,id]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop,pin]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop,id]` on the table `ItemCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop,categoryName]` on the table `ItemCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shop` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `ItemCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `Modifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionKind" AS ENUM ('SALE', 'TIP', 'PAYOUT', 'CASH_DROP', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD');

-- CreateEnum
CREATE TYPE "VoidKind" AS ENUM ('ITEM', 'TAB');

-- CreateEnum
CREATE TYPE "ItemSalesBucket" AS ENUM ('FOOD', 'DRINK', 'OTHER');

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "hourlyRate",
DROP COLUMN "hoursWorked",
DROP COLUMN "position",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shop" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ItemCategory" ADD COLUMN     "salesBucket" "ItemSalesBucket" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "shop" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Modifications" ADD COLUMN     "shop" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "tipCommissionRate" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePosition" (
    "shop" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeePosition_pkey" PRIMARY KEY ("shop","employeeId","positionId")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3),
    "hourlyRateAtTime" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftReport" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "totalSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "foodSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "drinkSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashCollected" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashPaidOut" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashTips" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "creditCardTips" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tipCommissionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashOwed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftTransaction" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "shiftReportId" INTEGER NOT NULL,
    "itemCategoryId" INTEGER,
    "kind" "TransactionKind" NOT NULL,
    "paymentMethod" "PaymentMethod",
    "reference" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "ShiftTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftVoid" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "shiftReportId" INTEGER NOT NULL,
    "itemCategoryId" INTEGER,
    "kind" "VoidKind" NOT NULL,
    "reference" TEXT,
    "amount" DECIMAL(10,2),
    "reason" TEXT,
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftVoid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Position_shop_idx" ON "Position"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Position_shop_id_key" ON "Position"("shop", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Position_shop_name_key" ON "Position"("shop", "name");

-- CreateIndex
CREATE INDEX "EmployeePosition_shop_idx" ON "EmployeePosition"("shop");

-- CreateIndex
CREATE INDEX "EmployeePosition_shop_positionId_idx" ON "EmployeePosition"("shop", "positionId");

-- CreateIndex
CREATE INDEX "Shift_shop_idx" ON "Shift"("shop");

-- CreateIndex
CREATE INDEX "Shift_shop_employeeId_idx" ON "Shift"("shop", "employeeId");

-- CreateIndex
CREATE INDEX "Shift_shop_positionId_idx" ON "Shift"("shop", "positionId");

-- CreateIndex
CREATE INDEX "Shift_shop_clockIn_idx" ON "Shift"("shop", "clockIn");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_shop_id_key" ON "Shift"("shop", "id");

-- CreateIndex
CREATE INDEX "ShiftReport_shop_idx" ON "ShiftReport"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftReport_shop_id_key" ON "ShiftReport"("shop", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftReport_shop_shiftId_key" ON "ShiftReport"("shop", "shiftId");

-- CreateIndex
CREATE INDEX "ShiftTransaction_shop_idx" ON "ShiftTransaction"("shop");

-- CreateIndex
CREATE INDEX "ShiftTransaction_shop_shiftReportId_idx" ON "ShiftTransaction"("shop", "shiftReportId");

-- CreateIndex
CREATE INDEX "ShiftTransaction_shop_kind_idx" ON "ShiftTransaction"("shop", "kind");

-- CreateIndex
CREATE INDEX "ShiftTransaction_shop_itemCategoryId_idx" ON "ShiftTransaction"("shop", "itemCategoryId");

-- CreateIndex
CREATE INDEX "ShiftVoid_shop_idx" ON "ShiftVoid"("shop");

-- CreateIndex
CREATE INDEX "ShiftVoid_shop_shiftReportId_idx" ON "ShiftVoid"("shop", "shiftReportId");

-- CreateIndex
CREATE INDEX "ShiftVoid_shop_kind_idx" ON "ShiftVoid"("shop", "kind");

-- CreateIndex
CREATE INDEX "ShiftVoid_shop_itemCategoryId_idx" ON "ShiftVoid"("shop", "itemCategoryId");

-- CreateIndex
CREATE INDEX "Employee_shop_idx" ON "Employee"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_shop_id_key" ON "Employee"("shop", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_shop_pin_key" ON "Employee"("shop", "pin");

-- CreateIndex
CREATE INDEX "ItemCategory_shop_idx" ON "ItemCategory"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_shop_id_key" ON "ItemCategory"("shop", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_shop_categoryName_key" ON "ItemCategory"("shop", "categoryName");

-- CreateIndex
CREATE INDEX "Modifications_shop_idx" ON "Modifications"("shop");

-- AddForeignKey
ALTER TABLE "EmployeePosition" ADD CONSTRAINT "EmployeePosition_shop_employeeId_fkey" FOREIGN KEY ("shop", "employeeId") REFERENCES "Employee"("shop", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePosition" ADD CONSTRAINT "EmployeePosition_shop_positionId_fkey" FOREIGN KEY ("shop", "positionId") REFERENCES "Position"("shop", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_shop_employeeId_fkey" FOREIGN KEY ("shop", "employeeId") REFERENCES "Employee"("shop", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_shop_positionId_fkey" FOREIGN KEY ("shop", "positionId") REFERENCES "Position"("shop", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftReport" ADD CONSTRAINT "ShiftReport_shop_shiftId_fkey" FOREIGN KEY ("shop", "shiftId") REFERENCES "Shift"("shop", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftTransaction" ADD CONSTRAINT "ShiftTransaction_shop_shiftReportId_fkey" FOREIGN KEY ("shop", "shiftReportId") REFERENCES "ShiftReport"("shop", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftTransaction" ADD CONSTRAINT "ShiftTransaction_shop_itemCategoryId_fkey" FOREIGN KEY ("shop", "itemCategoryId") REFERENCES "ItemCategory"("shop", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftVoid" ADD CONSTRAINT "ShiftVoid_shop_shiftReportId_fkey" FOREIGN KEY ("shop", "shiftReportId") REFERENCES "ShiftReport"("shop", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftVoid" ADD CONSTRAINT "ShiftVoid_shop_itemCategoryId_fkey" FOREIGN KEY ("shop", "itemCategoryId") REFERENCES "ItemCategory"("shop", "id") ON DELETE SET NULL ON UPDATE CASCADE;
