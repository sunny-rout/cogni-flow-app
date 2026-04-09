/*
  # Add Tags Column to Notes

  1. Changes
    - Add `tags` column to `notes` table as text array
    - Set default value to empty array
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'tags'
  ) THEN
    ALTER TABLE notes ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;
