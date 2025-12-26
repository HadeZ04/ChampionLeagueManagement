import { deleteTeam } from "./src/services/teamService";
import * as fs from 'fs';

const runDebug = async () => {
    console.log("Attempting to delete team 15 using service...");
    try {
        const result = await deleteTeam(15);
        console.log("Delete result:", result);
    } catch (err: any) {
        console.error("DELETE FAILED!");
        fs.writeFileSync('debug_error.json', JSON.stringify({
            message: err.message,
            number: err.number,
            originalError: err.originalError
        }, null, 2));
    }
};

runDebug().then(() => process.exit());
