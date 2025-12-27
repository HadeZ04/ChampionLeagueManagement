import { query } from '../src/db/sqlServer';
import { getOrFetchPlayerAvatar } from '../src/services/playerAvatarService';

/**
 * Script to remove players without avatars from database
 * Ensures all remaining players have avatars
 * 
 * Usage: npx ts-node backend/scripts/removePlayersWithoutAvatar.ts
 */

interface Player {
  player_id: number;
  full_name: string;
  team_name: string | null;
  avatar_url: string | null;
}

async function getAllPlayers(): Promise<Player[]> {
  console.log('📋 Fetching all players from database...');
  
  const result = await query<Player>(
    `SELECT 
      p.player_id,
      p.full_name,
      t.name as team_name,
      p.avatar_url
    FROM players p
    LEFT JOIN teams t ON p.current_team_id = t.team_id
    ORDER BY p.full_name;`
  );
  
  return result.recordset;
}

async function checkAndFetchAvatar(player: Player): Promise<string | null> {
  // If already has avatar_url in DB, return it
  if (player.avatar_url) {
    return player.avatar_url;
  }
  
  // Try to fetch from TheSportsDB
  try {
    const avatarUrl = await getOrFetchPlayerAvatar(player.player_id);
    return avatarUrl;
  } catch (error) {
    console.error(`   ❌ Error fetching avatar for ${player.full_name}:`, error);
    return null;
  }
}

async function deletePlayer(playerId: number): Promise<boolean> {
  try {
    await query(
      `DELETE FROM players WHERE player_id = @playerId;`,
      { playerId }
    );
    return true;
  } catch (error) {
    console.error(`   ❌ Error deleting player ${playerId}:`, error);
    return false;
  }
}

async function main() {
  console.log('═'.repeat(60));
  console.log('🗑️  REMOVE PLAYERS WITHOUT AVATAR');
  console.log('═'.repeat(60));
  console.log('This script will:');
  console.log('  1. Check all players for avatars');
  console.log('  2. Try to fetch missing avatars from TheSportsDB');
  console.log('  3. Delete players that still don\'t have avatars');
  console.log('═'.repeat(60));
  
  try {
    // Get all players
    const allPlayers = await getAllPlayers();
    console.log(`\n✅ Found ${allPlayers.length} players in database\n`);
    
    if (allPlayers.length === 0) {
      console.log('⚠️  No players found. Exiting.');
      return;
    }
    
    // Check each player
    const playersWithAvatar: Player[] = [];
    const playersWithoutAvatar: Player[] = [];
    const playersToDelete: Player[] = [];
    
    console.log('🔍 Checking players for avatars...\n');
    
    for (let i = 0; i < allPlayers.length; i++) {
      const player = allPlayers[i];
      const progress = `[${i + 1}/${allPlayers.length}]`;
      
      console.log(`${progress} Checking: ${player.full_name}`);
      console.log(`   Team: ${player.team_name || 'No team'}`);
      
      // Check if has avatar
      const avatarUrl = await checkAndFetchAvatar(player);
      
      if (avatarUrl) {
        playersWithAvatar.push(player);
        console.log(`   ✅ Has avatar: ${avatarUrl.substring(0, 60)}...`);
      } else {
        playersWithoutAvatar.push(player);
        playersToDelete.push(player);
        console.log(`   ❌ No avatar found - will be deleted`);
      }
      
      // Rate limiting delay (2 seconds between requests to TheSportsDB)
      if (i < allPlayers.length - 1 && !player.avatar_url) {
        console.log(`   ⏱️  Waiting 2s (rate limiting)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('');
    }
    
    // Summary before deletion
    console.log('\n' + '═'.repeat(60));
    console.log('📊 SUMMARY BEFORE DELETION');
    console.log('═'.repeat(60));
    console.log(`Total players: ${allPlayers.length}`);
    console.log(`✅ Players with avatar: ${playersWithAvatar.length}`);
    console.log(`❌ Players without avatar: ${playersWithoutAvatar.length}`);
    
    if (playersWithoutAvatar.length > 0) {
      console.log(`\n⚠️  Players to be deleted (${playersWithoutAvatar.length}):`);
      playersWithoutAvatar.forEach((player, idx) => {
        console.log(`   ${idx + 1}. ${player.full_name} (${player.team_name || 'No team'}) [ID: ${player.player_id}]`);
      });
      
      // Confirmation
      console.log('\n' + '═'.repeat(60));
      console.log(`⚠️  WARNING: This will delete ${playersWithoutAvatar.length} players!`);
      console.log('═'.repeat(60));
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Delete players
      console.log('\n🗑️  Deleting players without avatars...\n');
      let deletedCount = 0;
      let failedCount = 0;
      
      for (const player of playersToDelete) {
        console.log(`Deleting: ${player.full_name} (ID: ${player.player_id})...`);
        const success = await deletePlayer(player.player_id);
        if (success) {
          deletedCount++;
          console.log(`   ✅ Deleted successfully`);
        } else {
          failedCount++;
          console.log(`   ❌ Failed to delete`);
        }
      }
      
      // Final summary
      console.log('\n' + '═'.repeat(60));
      console.log('📊 FINAL SUMMARY');
      console.log('═'.repeat(60));
      console.log(`Total players checked: ${allPlayers.length}`);
      console.log(`✅ Players with avatar: ${playersWithAvatar.length}`);
      console.log(`🗑️  Players deleted: ${deletedCount}`);
      if (failedCount > 0) {
        console.log(`❌ Failed to delete: ${failedCount}`);
      }
      console.log(`📊 Remaining players: ${playersWithAvatar.length}`);
      console.log('═'.repeat(60));
      
      // Verify all remaining players have avatars
      console.log('\n🔍 Verifying remaining players have avatars...');
      const remainingPlayers = await getAllPlayers();
      const playersStillWithoutAvatar = remainingPlayers.filter(p => !p.avatar_url);
      
      if (playersStillWithoutAvatar.length > 0) {
        console.log(`⚠️  Warning: ${playersStillWithoutAvatar.length} players still don't have avatars:`);
        playersStillWithoutAvatar.forEach(p => {
          console.log(`   • ${p.full_name} (ID: ${p.player_id})`);
        });
      } else {
        console.log('✅ All remaining players have avatars!');
      }
      
    } else {
      console.log('\n✅ All players already have avatars! No deletion needed.');
    }
    
    console.log('\n✅ Script completed successfully!\n');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run script
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

