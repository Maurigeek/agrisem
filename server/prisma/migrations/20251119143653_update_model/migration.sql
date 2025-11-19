-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderAddressId" INTEGER;

-- CreateTable
CREATE TABLE "OrderAddress" (
    "id" SERIAL NOT NULL,
    "producerId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "OrderAddress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderAddressId_fkey" FOREIGN KEY ("orderAddressId") REFERENCES "OrderAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
