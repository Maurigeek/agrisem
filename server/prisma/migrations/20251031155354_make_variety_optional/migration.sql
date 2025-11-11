-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_varietyId_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "varietyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "Variety"("id") ON DELETE SET NULL ON UPDATE CASCADE;
