/**
 * Manual Test Script for Standings Tie-Break Logic
 * 
 * This script helps test the standings service with real database scenarios
 * Run this after setting up test data in your database
 */

import { getSeasonStandings } from "./services/standingsService_v2";
import { query } from "./db/sqlServer";

async function setupTestData(seasonId: number) {
  console.log(`\n📋 Setting up test data for season ${seasonId}...\n`);

  // Create 4 test teams if they don't exist
  const teams = [
    { name: "Test Team A", shortName: "TTA" },
    { name: "Test Team B", shortName: "TTB" },
    { name: "Test Team C", shortName: "TTC" },
    { name: "Test Team D", shortName: "TTD" },
  ];

  for (const team of teams) {
    await query(
      `
      IF NOT EXISTS (SELECT 1 FROM teams WHERE name = @name)
      BEGIN
        INSERT INTO teams (name, short_name) VALUES (@name, @shortName)
      END
      `,
      { name: team.name, shortName: team.shortName }
    );
  }

  // Get team IDs
  const teamResult = await query<{ team_id: number; name: string }>(
    `SELECT team_id, name FROM teams WHERE name LIKE 'Test Team%' ORDER BY name`
  );

  const teamIds = teamResult.recordset.map((t) => t.team_id);
  console.log(`✓ Teams ready: ${teamIds.join(", ")}`);

  // Add teams to season
  for (const teamId of teamIds) {
    await query(
      `
      IF NOT EXISTS (
        SELECT 1 FROM season_team_participants 
        WHERE season_id = @seasonId AND team_id = @teamId
      )
      BEGIN
        INSERT INTO season_team_participants (season_id, team_id, status)
        VALUES (@seasonId, @teamId, 'active')
      END
      `,
      { seasonId, teamId }
    );
  }

  console.log(`✓ Teams added to season ${seasonId}`);

  return teamIds;
}

async function testScenario1_LiveMode(seasonId: number) {
  console.log("\n\n" + "=".repeat(60));
  console.log("📊 TEST SCENARIO 1: LIVE Mode Standings");
  console.log("=".repeat(60));

  const standings = await getSeasonStandings(seasonId, "live");

  console.log("\n🔴 LIVE MODE (In-Season):");
  console.log("Rules: Only Points → Goal Difference → Goals For\n");

  standings.forEach((team, idx) => {
    console.log(
      `${team.rank}. ${team.teamName.padEnd(20)} | ` +
      `P: ${team.points.toString().padStart(2)} | ` +
      `GD: ${(team.goalDifference >= 0 ? "+" : "") + team.goalDifference.toString().padStart(2)} | ` +
      `GF: ${team.goalsFor.toString().padStart(2)} | ` +
      `W:${team.wins} D:${team.draws} L:${team.losses}`
    );
  });

  console.log("\n✅ LIVE mode allows teams with same stats to have sequential ranks");
}

async function testScenario2_FinalMode_H2H(seasonId: number) {
  console.log("\n\n" + "=".repeat(60));
  console.log("📊 TEST SCENARIO 2: FINAL Mode with Head-to-Head");
  console.log("=".repeat(60));

  const standings = await getSeasonStandings(seasonId, "final");

  console.log("\n🟢 FINAL MODE (End-of-Season):");
  console.log("Rules: Points → GD → Head-to-Head → Draw Lots\n");

  standings.forEach((team) => {
    const h2h = team.tieBreakInfo?.usedHeadToHead ? "⚖ H2H" : "";
    const drawLots = team.tieBreakInfo?.drawLotsRequired ? "🎲 DRAW" : "";
    const indicators = [h2h, drawLots].filter(Boolean).join(" ");

    console.log(
      `${team.rank}. ${team.teamName.padEnd(20)} | ` +
      `P: ${team.points.toString().padStart(2)} | ` +
      `GD: ${(team.goalDifference >= 0 ? "+" : "") + team.goalDifference.toString().padStart(2)} | ` +
      `${indicators ? indicators.padEnd(15) : "".padEnd(15)} | ` +
      `W:${team.wins} D:${team.draws} L:${team.losses}`
    );

    if (team.tieBreakInfo?.headToHeadRecords) {
      team.tieBreakInfo.headToHeadRecords.forEach((record) => {
        console.log(
          `   └─ vs ${record.opponentTeamName}: ${record.teamGoals}-${record.opponentGoals}`
        );
      });
    }

    if (team.tieBreakInfo?.tieBreakNote) {
      console.log(`   └─ Note: ${team.tieBreakInfo.tieBreakNote}`);
    }
  });
}

async function testScenario3_CompareModeBoth(seasonId: number) {
  console.log("\n\n" + "=".repeat(60));
  console.log("📊 TEST SCENARIO 3: Compare LIVE vs FINAL Mode");
  console.log("=".repeat(60));

  const liveStandings = await getSeasonStandings(seasonId, "live");
  const finalStandings = await getSeasonStandings(seasonId, "final");

  console.log("\nSIDE-BY-SIDE COMPARISON:\n");
  console.log("Rank | LIVE Mode Team           | FINAL Mode Team          | Different?");
  console.log("-".repeat(75));

  const maxLength = Math.max(liveStandings.length, finalStandings.length);

  for (let i = 0; i < maxLength; i++) {
    const liveTeam = liveStandings[i];
    const finalTeam = finalStandings[i];

    const liveName = liveTeam ? liveTeam.teamName : "N/A";
    const finalName = finalTeam ? finalTeam.teamName : "N/A";
    const isDifferent = liveName !== finalName ? "⚠️  YES" : "";

    console.log(
      `${(i + 1).toString().padStart(4)} | ` +
      `${liveName.padEnd(24)} | ` +
      `${finalName.padEnd(24)} | ` +
      `${isDifferent}`
    );
  }

  const differences = liveStandings.filter(
    (team, idx) => team.teamName !== finalStandings[idx]?.teamName
  );

  if (differences.length > 0) {
    console.log(`\n⚠️  ${differences.length} position(s) changed due to head-to-head tie-break!`);
  } else {
    console.log("\n✅ No differences between LIVE and FINAL mode for this scenario.");
  }
}

async function runManualTests() {
  try {
    console.log("\n🚀 Starting Manual Standings Tie-Break Tests\n");

    // Get a test season ID (you can change this)
    const seasonResult = await query<{ id: number; label: string }>(
      `SELECT TOP 1 id, label FROM seasons ORDER BY id DESC`
    );

    if (seasonResult.recordset.length === 0) {
      console.error("❌ No seasons found in database. Please create a season first.");
      return;
    }

    const seasonId = seasonResult.recordset[0].id;
    const seasonLabel = seasonResult.recordset[0].label;

    console.log(`📅 Using Season: ${seasonLabel} (ID: ${seasonId})\n`);

    // Setup test data (optional - comment out if you have real data)
    // await setupTestData(seasonId);

    // Run test scenarios
    await testScenario1_LiveMode(seasonId);
    await testScenario2_FinalMode_H2H(seasonId);
    await testScenario3_CompareModeBoth(seasonId);

    console.log("\n\n" + "=".repeat(60));
    console.log("✅ All manual tests completed!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Error running manual tests:", error);
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runManualTests()
    .then(() => {
      console.log("\n✨ Tests finished. Press Ctrl+C to exit.\n");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Fatal error:", error);
      process.exit(1);
    });
}

export { runManualTests, testScenario1_LiveMode, testScenario2_FinalMode_H2H };
