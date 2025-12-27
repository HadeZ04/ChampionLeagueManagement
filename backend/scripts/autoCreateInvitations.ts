/**
 * Script để tự động tạo lời mời cho mùa giải mới
 * 
 * Cách sử dụng:
 * 1. Đảm bảo đã có mùa giải trước hoàn thành với bảng xếp hạng
 * 2. Tạo mùa giải mới
 * 3. Chạy script này với các tham số phù hợp
 * 
 * Ví dụ:
 * ts-node backend/scripts/autoCreateInvitations.ts --seasonId 2 --previousSeasonId 1 --promotedTeamIds 10,11
 */

import { query } from "../src/db/sqlServer";
import * as invitationService from "../src/services/seasonInvitationService";

interface ScriptArgs {
  seasonId: number;
  previousSeasonId: number;
  promotedTeamIds?: number[];
  responseDeadlineDays?: number;
  userId: number;
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const parsedArgs: Partial<ScriptArgs> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    
    if (key === 'seasonId') {
      parsedArgs.seasonId = parseInt(value, 10);
    } else if (key === 'previousSeasonId') {
      parsedArgs.previousSeasonId = parseInt(value, 10);
    } else if (key === 'promotedTeamIds') {
      parsedArgs.promotedTeamIds = value.split(',').map(id => parseInt(id.trim(), 10));
    } else if (key === 'responseDeadlineDays') {
      parsedArgs.responseDeadlineDays = parseInt(value, 10);
    } else if (key === 'userId') {
      parsedArgs.userId = parseInt(value, 10);
    }
  }

  // Validate required arguments
  if (!parsedArgs.seasonId || !parsedArgs.previousSeasonId) {
    console.error('❌ Thiếu tham số bắt buộc!');
    console.log('\nCách sử dụng:');
    console.log('ts-node backend/scripts/autoCreateInvitations.ts --seasonId <ID> --previousSeasonId <ID> [--promotedTeamIds <ID1,ID2>] [--responseDeadlineDays <days>] [--userId <ID>]');
    console.log('\nVí dụ:');
    console.log('ts-node backend/scripts/autoCreateInvitations.ts --seasonId 2 --previousSeasonId 1 --promotedTeamIds 10,11 --responseDeadlineDays 14 --userId 1');
    process.exit(1);
  }

  // Get default userId from database (first admin user)
  let userId = parsedArgs.userId;
  if (!userId) {
    try {
      const userResult = await query<{ user_id: number }>(
        `SELECT TOP 1 user_id FROM user_accounts ORDER BY user_id ASC`
      );
      userId = userResult.recordset[0]?.user_id;
      if (!userId) {
        console.error('❌ Không tìm thấy user nào trong database. Vui lòng chỉ định --userId');
        process.exit(1);
      }
      console.log(`ℹ️  Sử dụng userId: ${userId}`);
    } catch (error) {
      console.error('❌ Lỗi khi lấy userId:', error);
      process.exit(1);
    }
  }

  try {
    console.log('\n📋 Thông tin yêu cầu:');
    console.log(`   - Season ID: ${parsedArgs.seasonId}`);
    console.log(`   - Previous Season ID: ${parsedArgs.previousSeasonId}`);
    console.log(`   - Promoted Team IDs: ${parsedArgs.promotedTeamIds?.join(', ') || 'Chưa chỉ định'}`);
    console.log(`   - Response Deadline: ${parsedArgs.responseDeadlineDays || 14} ngày`);
    console.log(`   - User ID: ${userId}`);

    // Validate seasons exist
    console.log('\n🔍 Kiểm tra mùa giải...');
    const seasonCheck = await query<{ season_id: number; name: string; status: string }>(
      `SELECT season_id, name, status FROM seasons WHERE season_id = @seasonId`,
      { seasonId: parsedArgs.seasonId }
    );

    if (!seasonCheck.recordset[0]) {
      console.error(`❌ Không tìm thấy mùa giải ID ${parsedArgs.seasonId}`);
      process.exit(1);
    }
    console.log(`✅ Mùa giải: ${seasonCheck.recordset[0].name} (${seasonCheck.recordset[0].status})`);

    const prevSeasonCheck = await query<{ season_id: number; name: string; status: string }>(
      `SELECT season_id, name, status FROM seasons WHERE season_id = @previousSeasonId`,
      { previousSeasonId: parsedArgs.previousSeasonId }
    );

    if (!prevSeasonCheck.recordset[0]) {
      console.error(`❌ Không tìm thấy mùa giải trước ID ${parsedArgs.previousSeasonId}`);
      process.exit(1);
    }
    console.log(`✅ Mùa giải trước: ${prevSeasonCheck.recordset[0].name} (${prevSeasonCheck.recordset[0].status})`);

    // Check top teams from previous season
    console.log('\n🔍 Lấy danh sách top 8 đội từ mùa giải trước...');
    const topTeams = await invitationService.getTopTeamsFromSeason(parsedArgs.previousSeasonId, 8);
    
    if (topTeams.length < 8) {
      console.warn(`⚠️  Cảnh báo: Chỉ tìm thấy ${topTeams.length}/8 đội trong mùa giải trước`);
    } else {
      console.log(`✅ Tìm thấy ${topTeams.length} đội:`);
      topTeams.forEach((team, index) => {
        console.log(`   ${index + 1}. ${team.teamName} (Rank: ${team.rank}, Points: ${team.points})`);
      });
    }

    // Validate promoted teams if provided
    if (parsedArgs.promotedTeamIds && parsedArgs.promotedTeamIds.length > 0) {
      console.log('\n🔍 Kiểm tra các đội thăng hạng...');
      for (const teamId of parsedArgs.promotedTeamIds) {
        const teamCheck = await query<{ team_id: number; name: string }>(
          `SELECT team_id, name FROM teams WHERE team_id = @teamId`,
          { teamId }
        );
        if (teamCheck.recordset[0]) {
          console.log(`✅ ${teamCheck.recordset[0].name} (ID: ${teamId})`);
        } else {
          console.error(`❌ Không tìm thấy đội ID ${teamId}`);
          process.exit(1);
        }
      }
    } else {
      console.log('\n⚠️  Chưa chỉ định đội thăng hạng. Vui lòng chỉ định --promotedTeamIds');
      console.log('   Ví dụ: --promotedTeamIds 10,11');
      process.exit(1);
    }

    // Create invitations
    console.log('\n📨 Đang tạo lời mời...');
    const result = await invitationService.autoCreateInvitations({
      seasonId: parsedArgs.seasonId,
      previousSeasonId: parsedArgs.previousSeasonId,
      invitedBy: userId,
      responseDeadlineDays: parsedArgs.responseDeadlineDays || 14,
      promotedTeamIds: parsedArgs.promotedTeamIds,
    });

    console.log('\n✅ Hoàn thành!');
    console.log(`   - Tổng số lời mời đã tạo: ${result.created}`);
    console.log(`   - Đội được giữ lại (retained): ${result.retained.length}`);
    console.log(`   - Đội thăng hạng (promoted): ${result.promoted.length}`);

    console.log('\n📋 Chi tiết các lời mời:');
    
    console.log('\n   🏆 Đội được giữ lại:');
    result.retained.forEach((inv, index) => {
      console.log(`   ${index + 1}. ${inv.teamName} (ID: ${inv.teamId}, Invitation ID: ${inv.invitationId})`);
    });

    if (result.promoted.length > 0) {
      console.log('\n   ⬆️  Đội thăng hạng:');
      result.promoted.forEach((inv, index) => {
        console.log(`   ${index + 1}. ${inv.teamName} (ID: ${inv.teamId}, Invitation ID: ${inv.invitationId})`);
      });
    }

    console.log('\n💡 Bạn có thể kiểm tra lời mời bằng API:');
    console.log(`   GET /api/seasons/${parsedArgs.seasonId}/invitations`);

  } catch (error: any) {
    console.error('\n❌ Lỗi:', error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

