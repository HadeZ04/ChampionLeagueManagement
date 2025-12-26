import { query } from '../../src/db/sqlServer';

async function checkSeasons() {
    try {
        const result = await query("SELECT TOP 5 * FROM seasons");
        console.log(result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkSeasons();
