import { query } from "../db/sqlServer";

const run = async () => {
    try {
        const result = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'match_audit_logs' AND COLUMN_NAME IN ('old_value', 'new_value')
        `);
        console.log(JSON.stringify(result.recordset, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
};

run();
