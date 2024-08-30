-- CreateTable
CREATE TABLE "Measures" (
    "measure_uuid" TEXT NOT NULL,
    "measure_datetime" TIMESTAMP(3) NOT NULL,
    "measure_type" TEXT NOT NULL,
    "has_confirmed" BOOLEAN NOT NULL,
    "image_url" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Measures_measure_uuid_key" ON "Measures"("measure_uuid");
