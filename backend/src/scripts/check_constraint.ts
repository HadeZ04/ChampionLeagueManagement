import { query } from "../db/sqlServer";

const run = async () => {
    try {
        const result = await query(`
            SELECT definition 
            FROM sys.check_constraints 
            WHERE name = 'CK_matches_status'
        `);
        console.log("Constraint Definition:", result.recordset[0]?.definition);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
};

run();
