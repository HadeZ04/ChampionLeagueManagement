import { query } from "../../src/db/sqlServer";

const findTeam = async () => {
    try {
        const result = await query("SELECT id, name FROM FootballTeams WHERE name LIKE '%Bod%'");
        console.log("Found teams:", result.recordset);
    } catch (err) {
        console.error(err);
    }
};

findTeam().then(() => process.exit());
