-- 001_create_messages_room_chat.sql
-- Idempotent migration: creates `messages` table (supports both private and public/room messages)
-- and adds indexes + RLS policies suitable for Supabase.

-- ensure uuid helper exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- create table if not exists (recipient_id is NULLable to support room chat)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'messages'
  ) THEN
    CREATE TABLE public.messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      recipient_id UUID NULL REFERENCES public.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      is_read BOOLEAN DEFAULT FALSE
    );
  END IF;
END$$;

-- if messages exists but recipient_id is NOT NULL, make it nullable (safe to run)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'recipient_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.messages ALTER COLUMN recipient_id DROP NOT NULL;
  END IF;
END$$;

-- indexes
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages (recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);

-- Enable Row Level Security and policies for authenticated access
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow SELECT on room messages (recipient_id IS NULL) and messages where user is sender/recipient
DROP POLICY IF EXISTS "select_room_and_conversation" ON public.messages;
CREATE POLICY "select_room_and_conversation"
  ON public.messages
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      recipient_id IS NULL
      OR auth.uid() = sender_id
      OR auth.uid() = recipient_id
    )
  );

-- Allow INSERT only for authenticated users and only if sender_id = auth.uid() and recipient is null or self
DROP POLICY IF EXISTS "insert_messages_authenticated" ON public.messages;
CREATE POLICY "insert_messages_authenticated"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND auth.uid() = sender_id
    AND (recipient_id IS NULL OR recipient_id = auth.uid())
  );

-- Allow users to update/delete only their own messages
DROP POLICY IF EXISTS "update_own_messages" ON public.messages;
CREATE POLICY "update_own_messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "delete_own_messages" ON public.messages;
CREATE POLICY "delete_own_messages"
  ON public.messages
  FOR DELETE
  USING (auth.uid() = sender_id);

-- Optional: grant minimal privileges to authenticated role (RLS still applies)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;

-- Done

-- Notes:
-- - This migration is idempotent and safe to run multiple times.
-- - Room (public) messages are represented by recipient_id = NULL.
-- - Private messages use recipient_id = <uuid>.
