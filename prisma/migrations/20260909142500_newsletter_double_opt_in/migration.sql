ALTER TABLE "NewsletterSubscriber"
ADD COLUMN "confirmationTokenHash" TEXT,
ADD COLUMN "confirmationSentAt" TIMESTAMP(3),
ADD COLUMN "lastConfirmationRequestedAt" TIMESTAMP(3),
ADD COLUMN "confirmedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "NewsletterSubscriber"
ALTER COLUMN "isActive" SET DEFAULT false;

CREATE UNIQUE INDEX "NewsletterSubscriber_confirmationTokenHash_key" ON "NewsletterSubscriber"("confirmationTokenHash");
CREATE INDEX "NewsletterSubscriber_isActive_confirmedAt_idx" ON "NewsletterSubscriber"("isActive", "confirmedAt");
CREATE INDEX "NewsletterSubscriber_subscribedAt_idx" ON "NewsletterSubscriber"("subscribedAt");
