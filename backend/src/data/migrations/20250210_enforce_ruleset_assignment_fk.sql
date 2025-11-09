/* ============================================================
   Migration: Enforce FK on season_ruleset_assignments.season_id
   Purpose : Guarantees that every assignment references a
             valid season record and cascades deletions.
   Date    : 2025-02-10
   ============================================================ */

IF OBJECT_ID('season_ruleset_assignments', 'U') IS NOT NULL
    AND OBJECT_ID('seasons', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = 'FK_season_ruleset_assignments_seasons'
          AND parent_object_id = OBJECT_ID('season_ruleset_assignments')
    )
    BEGIN
        ALTER TABLE season_ruleset_assignments WITH CHECK
        ADD CONSTRAINT FK_season_ruleset_assignments_seasons
            FOREIGN KEY (season_id)
            REFERENCES seasons(season_id)
            ON DELETE CASCADE;
    END
END
GO
