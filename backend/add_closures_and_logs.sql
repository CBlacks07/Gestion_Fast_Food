-- Migration: Add Daily Closures and Activity Logs
-- Date: 2025-11-14

-- Create ActivityType enum
CREATE TYPE "ActivityType" AS ENUM (
'USER_LOGIN',
'USER_LOGOUT',
'USER_CREATED',
'USER_UPDATED',
'USER_DELETED',
'PRODUCT_CREATED',
'PRODUCT_UPDATED',
'PRODUCT_DELETED',
'CATEGORY_CREATED',
'CATEGORY_UPDATED',
'CATEGORY_DELETED',
'ORDER_CREATED',
'ORDER_CANCELLED',
'PAYMENT_CREATED',
'STOCK_ADJUSTED',
'DAILY_CLOSURE',
'SYSTEM_ERROR'
);

-- Create daily_closures table
CREATE TABLE "daily_closures" (
"id" TEXT NOT NULL,
"date" TIMESTAMP(3) NOT NULL,
"closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"closedBy" TEXT NOT NULL,
"totalOrders" INTEGER NOT NULL,
"completedOrders" INTEGER NOT NULL,
"cancelledOrders" INTEGER NOT NULL,
"totalRevenue" DECIMAL(12,2) NOT NULL,
"totalCash" DECIMAL(12,2) NOT NULL,
"totalTmoney" DECIMAL(12,2) NOT NULL,
"totalFlooz" DECIMAL(12,2) NOT NULL,
"totalCard" DECIMAL(12,2) NOT NULL,
"totalMobile" DECIMAL(12,2) NOT NULL,
"totalOther" DECIMAL(12,2) NOT NULL,
"detailedReport" TEXT NOT NULL,
"notes" TEXT,

CONSTRAINT "daily_closures_pkey" PRIMARY KEY ("id"),
CONSTRAINT "daily_closures_date_closedBy_key" UNIQUE ("date", "closedBy")
);

-- Create activity_logs table
CREATE TABLE "activity_logs" (
"id" TEXT NOT NULL,
"type" "ActivityType" NOT NULL,
"userId" TEXT,
"targetId" TEXT,
"description" TEXT NOT NULL,
"metadata" TEXT,
"ipAddress" TEXT,
"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "daily_closures"
ADD CONSTRAINT "daily_closures_closedBy_fkey"
FOREIGN KEY ("closedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_logs"
ADD CONSTRAINT "activity_logs_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");
CREATE INDEX "activity_logs_type_idx" ON "activity_logs"("type");
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- Success message
DO $$
BEGIN
RAISE NOTICE 'Migration completed successfully: daily_closures and activity_logs tables created';
END $$;
