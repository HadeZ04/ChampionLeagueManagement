import { query } from './src/db/sqlServer';

async function checkColumns() {
    try {
        const schema = await query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Matches'");
        console.log(JSON.stringify(schema.recordset.map(r => r.COLUMN_NAME)));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkColumns();
