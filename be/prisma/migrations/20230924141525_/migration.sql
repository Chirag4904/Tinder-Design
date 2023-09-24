/*
  Warnings:

  - A unique constraint covering the columns `[USER_A_ID,USER_B_ID]` on the table `Feeds` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Feeds_USER_A_ID_USER_B_ID_key` ON `Feeds`(`USER_A_ID`, `USER_B_ID`);
