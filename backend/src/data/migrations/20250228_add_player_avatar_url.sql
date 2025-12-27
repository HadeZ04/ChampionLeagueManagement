/*
  Add avatar_url column to players table
  ----------------------------------------------------
  Adds avatar_url column to store player avatar URLs from TheSportsDB
*/

SET NOCOUNT ON;

IF DB_NAME() IS NULL
BEGIN
  THROW 50000, 'Please run USE <database> before executing this migration.', 1;
END;

PRINT '>> Adding avatar_url column to players table...';

IF COL_LENGTH('players', 'avatar_url') IS NULL
BEGIN
  ALTER TABLE players
    ADD avatar_url NVARCHAR(1024) NULL;
  
  PRINT '✅ Added avatar_url column to players table';
END
ELSE
BEGIN
  PRINT 'ℹ️  Column avatar_url already exists in players table';
END;

GO

