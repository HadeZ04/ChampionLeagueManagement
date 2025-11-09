/**
 * Utility script to initialize and calculate standings for all active seasons
 * 
 * Usage:
 *   npx ts-node backend/scripts/initializeStandings.ts
 *   npx ts-node backend/scripts/initializeStandings.ts --seasonId=1
 */

import { query } from "../src/db/sqlServer";
import { 
  initializeStandingsForSeason, 
  calculateStandings,
  getStandingsForSeason 
} from "../src/services/standingsAdminService";

interface Season {
  season_id: number;
  name: string;
  code: string | null;
  status: string;
}

async function main() {
  const args = process.argv.slice(2);
  const seasonIdArg = args.find(arg => arg.startsWith('--seasonId='));
  const specificSeasonId = seasonIdArg ? parseInt(seasonIdArg.split('=')[1], 10) : null;

  try {
    console.log('🏆 Starting Standings Initialization Script\n');

    let seasons: Season[];

    if (specificSeasonId) {
      // Process specific season
      const result = await query<Season>(
        `SELECT season_id, name, code, status FROM seasons WHERE season_id = @seasonId`,
        { seasonId: specificSeasonId }
      );
      
      if (result.recordset.length === 0) {
        console.error(`❌ Season with ID ${specificSeasonId} not found`);
        process.exit(1);
      }
      
      seasons = result.recordset;
    } else {
      // Process all active seasons
      const result = await query<Season>(
        `SELECT season_id, name, code, status 
         FROM seasons 
         WHERE status IN ('in_progress', 'scheduled')
         ORDER BY start_date DESC`
      );
      seasons = result.recordset;
    }

    if (seasons.length === 0) {
      console.log('ℹ️  No active seasons found');
      process.exit(0);
    }

    console.log(`Found ${seasons.length} season(s) to process:\n`);

    for (const season of seasons) {
      console.log(`\n📊 Processing Season: ${season.name} (ID: ${season.season_id}, Status: ${season.status})`);
      console.log('─'.repeat(60));

      try {
        // Step 1: Initialize empty standings records
        console.log('  1️⃣  Initializing standings records...');
        const count = await initializeStandingsForSeason(season.season_id);
        console.log(`     ✅ Initialized ${count} team record(s)`);

        // Step 2: Calculate standings from match results
        console.log('  2️⃣  Calculating standings from matches...');
        await calculateStandings(season.season_id);
        console.log('     ✅ Standings calculated');

        // Step 3: Display results
        console.log('  3️⃣  Current standings:');
        const standings = await getStandingsForSeason(season.season_id);
        
        if (standings.length === 0) {
          console.log('     ℹ️  No teams found in standings');
        } else {
          console.log('\n     Pos | Team                    | P  | W  | D  | L  | GF | GA | GD  | Pts');
          console.log('     ' + '─'.repeat(75));
          
          standings.slice(0, 10).forEach((team, index) => {
            const rank = String(index + 1).padStart(3);
            const name = team.teamName.padEnd(23);
            const p = String(team.matchesPlayed).padStart(2);
            const w = String(team.wins).padStart(2);
            const d = String(team.draws).padStart(2);
            const l = String(team.losses).padStart(2);
            const gf = String(team.goalsFor).padStart(2);
            const ga = String(team.goalsAgainst).padStart(2);
            const gd = String(team.goalDifference).padStart(3);
            const pts = String(team.points).padStart(3);
            
            console.log(`     ${rank} | ${name} | ${p} | ${w} | ${d} | ${l} | ${gf} | ${ga} | ${gd} | ${pts}`);
          });
          
          if (standings.length > 10) {
            console.log(`     ... and ${standings.length - 10} more team(s)`);
          }
        }

        console.log(`\n  ✅ Season ${season.name} processed successfully`);
      } catch (error) {
        console.error(`  ❌ Error processing season ${season.name}:`, error);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✨ Standings initialization completed!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

main();

