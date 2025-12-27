/*
  Add Governing Body Location Support
  ----------------------------------------------------
  Idempotent SQL Server migration to support tracking
  whether the team's governing body has an office in Vietnam.
  
  This field is used to validate team eligibility requirements
  that require the governing body to be located in Vietnam.

  How to run:
    1) USE <your_database>;
    2) Execute this script.
*/

SET NOCOUNT ON;

IF DB_NAME() IS NULL
BEGIN
  THROW 50000, 'Please run USE <database> before executing this migration.', 1;
END;

PRINT '>> Adding governing_body_in_vietnam field to teams table...';

IF COL_LENGTH('dbo.teams', 'governing_body_in_vietnam') IS NULL
BEGIN
  ALTER TABLE dbo.teams
    ADD governing_body_in_vietnam BIT NULL;
  
  PRINT '>> Field governing_body_in_vietnam added successfully.';
END
ELSE
BEGIN
  PRINT '>> Field governing_body_in_vietnam already exists.';
END;
GO

-- Update existing records: if country is Vietnam, assume governing body is also in Vietnam
PRINT '>> Updating existing records...';
UPDATE dbo.teams
SET governing_body_in_vietnam = 1
WHERE governing_body_in_vietnam IS NULL
  AND country IS NOT NULL
  AND (
    LOWER(country) LIKE '%vietnam%' 
    OR LOWER(country) LIKE '%việt nam%'
    OR LOWER(country) = 'vn'
  );
  
PRINT '>> Updated existing records based on country field.';
GO

PRINT '>> Migration completed successfully.';
GO

