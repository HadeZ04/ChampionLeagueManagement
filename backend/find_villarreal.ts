import { query } from "./src/db/sqlServer";

const findTeam = async () => {
    try {
        const result = await query("SELECT * FROM teams WHERE name LIKE '%Villarreal%'");
        console.log(result.recordset);
    } catch (err) {
        console.error(err);
    }
};

findTeam().then(() => process.exit());
