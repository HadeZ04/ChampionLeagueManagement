import fs from 'fs';
import path from 'path';
import { query } from '../src/db/sqlServer';

async function run() {
    const sqlFilePath = process.argv[2];
    if (!sqlFilePath) {
        console.error('Please provide the path to the SQL file as an argument.');
        process.exit(1);
    }

    try {
        const fullPath = path.resolve(process.cwd(), sqlFilePath);
        console.log(`Reading SQL file from: ${fullPath}`);

        if (!fs.existsSync(fullPath)) {
            console.error('File not found!');
            process.exit(1);
        }

        const sqlContent = fs.readFileSync(fullPath, 'utf-8');

        console.log('Executing SQL...');
        // Execute the query
        const result: any = await query(sqlContent);

        if (result && result.recordsets && result.recordsets.length > 0) {
            result.recordsets.forEach((set: any, i: number) => {
                console.log(`--- Result Set ${i + 1} ---`);
                console.log(JSON.stringify(set, null, 2));
            });
        }

        console.log('✅ SQL executed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error executing SQL:', error);
        process.exit(1);
    }
}

run();
