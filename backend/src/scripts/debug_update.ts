import { updateMatch, getMatchById } from "../services/matchService";
import { query } from "../db/sqlServer";

const run = async () => {
    try {
        console.log("Fetching a match...");
        const result = await query("SELECT TOP 1 match_id FROM matches");
        if (result.recordset.length === 0) {
            console.log("No matches found.");
            return;
        }
        const matchId = result.recordset[0].match_id;
        console.log(`Testing update on matchId: ${matchId}`);

        // Test 1: Update Status to 'live'
        console.log("Test 1: Update status to 'live'");
        try {
            await updateMatch(matchId, { status: 'live' });
            console.log("Success: Status 'live'");
        } catch (e) {
            console.error("Failed Test 1:", e);
        }

        // Test 2: Update Status to 'Live' (Capitalized)
        console.log("Test 2: Update status to 'Live'");
        try {
            await updateMatch(matchId, { status: 'Live' });
            console.log("Success: Status 'Live'");
        } catch (e) {
            console.error("Failed Test 2:", e);
        }

        // Test 3: Update with extra fields (stadiumId, description)
        console.log("Test 3: Update with stadiumId and description");
        try {
            // @ts-ignore
            await updateMatch(matchId, { status: 'live', stadiumId: 1, description: 'Test reason' });
            console.log("Success: Extra fields");
        } catch (e) {
            console.error("Failed Test 3:", e);
        }

    } catch (err) {
        console.error("Global error:", err);
    }
};

run();
