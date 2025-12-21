-- Add status columns to season_player_registrations

IF NOT EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID(N'[dbo].[season_player_registrations]') 
  AND name = 'status'
)
BEGIN
    ALTER TABLE [dbo].[season_player_registrations]
    ADD [status] NVARCHAR(20) NOT NULL DEFAULT 'PENDING';
END

IF NOT EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID(N'[dbo].[season_player_registrations]') 
  AND name = 'approved_at'
)
BEGIN
    ALTER TABLE [dbo].[season_player_registrations]
    ADD [approved_at] DATETIME NULL;
END

IF NOT EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID(N'[dbo].[season_player_registrations]') 
  AND name = 'reject_reason'
)
BEGIN
    ALTER TABLE [dbo].[season_player_registrations]
    ADD [reject_reason] NVARCHAR(255) NULL;
END
ALTER TABLE season_player_registrations
ADD
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at DATETIME NULL,
    reject_reason NVARCHAR(255) NULL;
