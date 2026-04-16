-- CreateIndex
CREATE INDEX "Order_userId_marketId_status_idx" ON "Order"("userId", "marketId", "status");
