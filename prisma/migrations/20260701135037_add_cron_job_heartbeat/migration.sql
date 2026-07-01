CREATE TABLE "CronJobHeartbeat" (
  "jobName" TEXT NOT NULL,
  "lastSuccessAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CronJobHeartbeat_pkey" PRIMARY KEY ("jobName")
);
