import { query } from '../../src/db/sqlServer';

async function checkColumns() {
    try {
        const result = await query("SELECT TOP 1 * FROM dbo.Matches");
        if (result.recordset.length > 0) {
            console.log('Columns in dbo.Matches:', Object.keys(result.recordset[0]));
        } else {
            console.log('No rows in dbo.Matches, checking schema...');
            const schema = await query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Matches'");
            console.log('Columns:', schema.recordset.map(r => r.COLUMN_NAME));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkColumns();
