-- =====================================================
-- rival project - full database setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =====================================================

-- Enum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  "id"           TEXT NOT NULL,
  "email"        TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role"         "Role" NOT NULL DEFAULT 'USER',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Blogs table
CREATE TABLE IF NOT EXISTS "Blog" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "content"     TEXT NOT NULL,
  "summary"     TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Blog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Blog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Blog_slug_key" ON "Blog"("slug");

-- Likes table
CREATE TABLE IF NOT EXISTS "Like" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "blogId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Like_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Like_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Like_userId_blogId_key" ON "Like"("userId", "blogId");

-- Comments table
CREATE TABLE IF NOT EXISTS "Comment" (
  "id"        TEXT NOT NULL,
  "blogId"    TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Comment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Comment_blogId_idx" ON "Comment"("blogId");
CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" ON "Comment"("createdAt");

-- Prisma migrations tracking table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                      VARCHAR(36)  NOT NULL,
  "checksum"                VARCHAR(64)  NOT NULL,
  "finished_at"             TIMESTAMPTZ,
  "migration_name"          VARCHAR(255) NOT NULL,
  "logs"                    TEXT,
  "rolled_back_at"          TIMESTAMPTZ,
  "started_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "applied_steps_count"     INT          NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Done!
SELECT 'Database setup complete ✅' AS status;
