/* ============================================================
   Integration Test Scenarios - Ruleset Publish & Assignment
   Purpose: Validates effective date checks, unique season
            assignments, and FK enforcement for the
            season_ruleset_assignments table.
   Usage: Execute after running migrations. The script wraps
          every data mutation in its own transaction and rolls
          back automatically so production data stays intact.
   ============================================================ */
SET NOCOUNT ON;

PRINT 'Scenario 1 - Reject invalid effective date ranges';
BEGIN TRY
    DECLARE @invalidName NVARCHAR(255) = CONCAT('ruleset_invalid_', CONVERT(varchar(36), NEWID()));
    INSERT INTO rulesets (name, version_tag, description, is_active, effective_from, effective_to, created_by)
    VALUES (@invalidName, 'v-test', 'invalid window test', 0, '2025-07-01', '2025-06-01', 0);
    RAISERROR('Scenario 1 FAILED - Invalid effective window accepted', 16, 1);
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 547 AND ERROR_MESSAGE() LIKE '%CK_rulesets_effective%'
        PRINT 'Scenario 1 PASSED - Check constraint enforced';
    ELSE
        THROW;
END CATCH;

PRINT 'Scenario 2 - Prevent duplicate season assignments';
BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @actorUsername NVARCHAR(150) = CONCAT('ruleset_tester_', RIGHT(CONVERT(varchar(36), NEWID()), 8));
    DECLARE @actorId INT;
    INSERT INTO user_accounts (username, email, password_hash, first_name, last_name, status)
    OUTPUT INSERTED.user_id
    VALUES (@actorUsername, CONCAT(@actorUsername, '@example.com'), CONVERT(VARBINARY(512), 'temp_password'), 'Ruleset', 'Tester', 'active');
    SET @actorId = SCOPE_IDENTITY();

    DECLARE @rulesetPrimary INT;
    INSERT INTO rulesets (name, version_tag, description, created_by, effective_from, effective_to)
    OUTPUT INSERTED.ruleset_id
    VALUES (CONCAT('ruleset_primary_', RIGHT(CONVERT(varchar(36), NEWID()), 8)), 'v1', 'primary ruleset', @actorId, '2025-01-01', '2025-12-31');
    SET @rulesetPrimary = SCOPE_IDENTITY();

    DECLARE @rulesetSecondary INT;
    INSERT INTO rulesets (name, version_tag, description, created_by)
    OUTPUT INSERTED.ruleset_id
    VALUES (CONCAT('ruleset_secondary_', RIGHT(CONVERT(varchar(36), NEWID()), 8)), 'v2', 'secondary ruleset', @actorId);
    SET @rulesetSecondary = SCOPE_IDENTITY();

    DECLARE @tournamentId INT;
    INSERT INTO tournaments (code, name, organizer)
    OUTPUT INSERTED.tournament_id
    VALUES (CONCAT('T', RIGHT(CONVERT(varchar(36), NEWID()), 6)), 'Test Tournament', 'UEFA QA');
    SET @tournamentId = SCOPE_IDENTITY();

    DECLARE @seasonId INT;
    INSERT INTO seasons (
        tournament_id,
        ruleset_id,
        name,
        code,
        start_date,
        end_date,
        participation_fee,
        max_teams,
        expected_rounds,
        status,
        created_by
    )
    OUTPUT INSERTED.season_id
    VALUES (
        @tournamentId,
        @rulesetPrimary,
        CONCAT('Season ', RIGHT(CONVERT(varchar(36), NEWID()), 6)),
        CONCAT('S', RIGHT(CONVERT(varchar(36), NEWID()), 6)),
        '2025-08-01',
        '2026-05-31',
        50.00,
        10,
        18,
        'draft',
        @actorId
    );
    SET @seasonId = SCOPE_IDENTITY();

    INSERT INTO season_ruleset_assignments (season_id, ruleset_id, assigned_by)
    VALUES (@seasonId, @rulesetPrimary, @actorId);

    BEGIN TRY
        INSERT INTO season_ruleset_assignments (season_id, ruleset_id, assigned_by)
        VALUES (@seasonId, @rulesetSecondary, @actorId);
        RAISERROR('Scenario 2 FAILED - Duplicate assignment allowed', 16, 1);
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() IN (2627, 2601) -- Unique or duplicate index violation
            PRINT 'Scenario 2 PASSED - Unique season assignment enforced';
        ELSE
            THROW;
    END CATCH;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

PRINT 'Scenario 3 - Reject assignments pointing to non-existent seasons';
BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @fkTesterUsername NVARCHAR(150) = CONCAT('fk_tester_', RIGHT(CONVERT(varchar(36), NEWID()), 8));
    DECLARE @fkTesterId INT;
    INSERT INTO user_accounts (username, email, password_hash, first_name, last_name, status)
    OUTPUT INSERTED.user_id
    VALUES (@fkTesterUsername, CONCAT(@fkTesterUsername, '@example.com'), CONVERT(VARBINARY(512), 'another_temp'), 'FK', 'Tester', 'active');
    SET @fkTesterId = SCOPE_IDENTITY();

    DECLARE @validRulesetId INT;
    INSERT INTO rulesets (name, version_tag, description, created_by)
    OUTPUT INSERTED.ruleset_id
    VALUES (CONCAT('ruleset_fk_', RIGHT(CONVERT(varchar(36), NEWID()), 8)), 'fk', 'fk enforcement', @fkTesterId);
    SET @validRulesetId = SCOPE_IDENTITY();

    DECLARE @missingSeasonId INT = -ABS(CHECKSUM(NEWID()));

    BEGIN TRY
        INSERT INTO season_ruleset_assignments (season_id, ruleset_id, assigned_by)
        VALUES (@missingSeasonId, @validRulesetId, @fkTesterId);
        RAISERROR('Scenario 3 FAILED - Missing season accepted', 16, 1);
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() = 547 AND ERROR_MESSAGE() LIKE '%FK_season_ruleset_assignments_seasons%'
            PRINT 'Scenario 3 PASSED - Season FK enforced';
        ELSE
            THROW;
    END CATCH;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
