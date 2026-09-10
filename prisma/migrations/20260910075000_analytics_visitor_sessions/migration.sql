ALTER TABLE "PageView" ADD COLUMN "visitorId" TEXT;
ALTER TABLE "PageView" ADD COLUMN "sessionId" TEXT;

CREATE INDEX "PageView_visitorId_createdAt_idx" ON "PageView"("visitorId", "createdAt");
CREATE INDEX "PageView_sessionId_createdAt_idx" ON "PageView"("sessionId", "createdAt");
