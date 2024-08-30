/*
  Warnings:

  - Added the required column `measure_datatime_month` to the `Measures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Measures" ADD COLUMN     "measure_datatime_month" INTEGER NOT NULL;
