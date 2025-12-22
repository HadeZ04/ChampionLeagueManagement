import { query } from "../db/sqlServer";

const run = async () => {
    try {
        console.log("Altering match_audit_logs table...");

        await query(`
            ALTER TABLE match_audit_logs 
            ALTER COLUMN old_value NVARCHAR(MAX);
        `);
        console.log("old_value column updated.");

        await query(`
            ALTER TABLE match_audit_logs 
            ALTER COLUMN new_value NVARCHAR(MAX);
        `);
        console.log("new_value column updated.");

        console.log("Successfully updated match_audit_logs schema.");
    } catch (err) {
        console.error("Failed to alter table:", err);
    }
    process.exit(0);
};

run();
