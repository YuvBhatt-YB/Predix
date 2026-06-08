-- CreateIndex
CREATE INDEX "Holdings_userId_idx" ON "Holdings"("userId");

-- CreateIndex
CREATE INDEX "Order_userId_status_createdAt_idx" ON "Order"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Trade_buyerId_createdAt_idx" ON "Trade"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "Trade_sellerId_createdAt_idx" ON "Trade"("sellerId", "createdAt");

-- CreateIndex
CREATE INDEX "Trade_marketId_createdAt_idx" ON "Trade"("marketId", "createdAt");
