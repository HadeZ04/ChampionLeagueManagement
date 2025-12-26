import { query } from './src/db/sqlServer';

async function checkSeasonColumn() {
    try {
        const result = await query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Matches' AND COLUMN_NAME = 'season'");
        console.log('Season Column Exists:', result.recordset.length > 0);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkSeasonColumn();
