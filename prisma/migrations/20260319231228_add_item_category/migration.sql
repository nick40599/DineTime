/*
  Warnings:

  - You are about to drop the column `shop` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `shop` on the `Modifications` table. All the data in the column will be lost.
  - Added the required column `hoursWorked` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `productId` on the `Modifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "shop",
ADD COLUMN     "hoursWorked" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Modifications" DROP COLUMN "shop",
DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "maxNumItems" INTEGER NOT NULL,
    "printerId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id")
);
