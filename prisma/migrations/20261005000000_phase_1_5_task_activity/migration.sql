-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ShowStatus" AS ENUM ('PLANNING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShowRole" AS ENUM ('PM', 'PA1', 'PA2', 'PA3', 'SE', 'SSE', 'PE', 'SAE', 'PRODUCTION', 'SOCIAL', 'TALENT_ASSISTANT', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'STUCK', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('NORMAL', 'IMPORTANT', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskActivityType" AS ENUM ('TASK_CREATED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED', 'STATUS_CHANGED', 'DEADLINE_CHANGED', 'DELIVERABLE_ADDED', 'DELIVERABLE_REMOVED', 'STUCK_REPORTED', 'STUCK_RESOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "department" TEXT,
    "companyRole" "CompanyRole" NOT NULL DEFAULT 'MEMBER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "showDate" DATE NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "city" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "scale" TEXT,
    "goal" TEXT,
    "status" "ShowStatus" NOT NULL DEFAULT 'PLANNING',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowMember" (
    "id" TEXT NOT NULL,
    "showId" TEXT,
    "userId" TEXT NOT NULL,
    "role" "ShowRole" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShowMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "phase" TEXT,
    "department" TEXT,
    "startDate" DATE,
    "plannedDeadline" TIMESTAMP(3) NOT NULL,
    "currentDeadline" TIMESTAMP(3) NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "stuckReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskActivity" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "type" "TaskActivityType" NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignee" (
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TaskAssignee_pkey" PRIMARY KEY ("taskId","userId")
);

-- CreateTable
CREATE TABLE "TaskDeliverable" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "predecessorTaskId" TEXT NOT NULL,
    "successorTaskId" TEXT NOT NULL,
    "lagDays" INTEGER NOT NULL DEFAULT 0,
    "autoAdjust" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ShowMember_showId_idx" ON "ShowMember"("showId");

-- CreateIndex
CREATE UNIQUE INDEX "ShowMember_showId_userId_key" ON "ShowMember"("showId", "userId");

-- CreateIndex
CREATE INDEX "Task_showId_status_idx" ON "Task"("showId", "status");

-- CreateIndex
CREATE INDEX "TaskActivity_taskId_createdAt_idx" ON "TaskActivity"("taskId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_predecessorTaskId_successorTaskId_key" ON "TaskDependency"("predecessorTaskId", "successorTaskId");

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowMember" ADD CONSTRAINT "ShowMember_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowMember" ADD CONSTRAINT "ShowMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDeliverable" ADD CONSTRAINT "TaskDeliverable_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDeliverable" ADD CONSTRAINT "TaskDeliverable_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_predecessorTaskId_fkey" FOREIGN KEY ("predecessorTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_successorTaskId_fkey" FOREIGN KEY ("successorTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
