// src/lib/scheduleGenerator.js

/**
 * Thuật toán tạo lịch thi đấu vòng tròn (Round-Robin) sử dụng Circle Method.
 * @param {Array<string>} teams - Mảng chứa tên các đội bóng.
 * @returns {Array<object>} Mảng chứa các trận đấu đã được xếp lịch.
 */
export function generateRoundRobinSchedule(teams) {
  // Xử lý số đội lẻ bằng cách thêm "đội ảo" (bye)
  let scheduleTeams = [...teams];
  if (scheduleTeams.length % 2 !== 0) {
    scheduleTeams.push("BYE"); // Đội ảo để xử lý đội được nghỉ
  }

  const numTeams = scheduleTeams.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const fixtures = [];

  const teamIndexes = Array.from({ length: numTeams }, (_, i) => i);

  for (let round = 0; round < numRounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const homeIndex = teamIndexes[match];
      const awayIndex = teamIndexes[numTeams - 1 - match];

      // Bỏ qua trận đấu với đội ảo
      if (scheduleTeams[homeIndex] === "BYE" || scheduleTeams[awayIndex] === "BYE") {
        continue;
      }
      
      // Lượt đi: phân chia sân nhà/sân khách
      if (match === 0 && round % 2 !== 0) {
         fixtures.push({
          round: round + 1,
          home: scheduleTeams[awayIndex],
          away: scheduleTeams[homeIndex],
        });
      } else {
        fixtures.push({
          round: round + 1,
          home: scheduleTeams[homeIndex],
          away: scheduleTeams[awayIndex],
        });
      }
    }

    // Xoay vòng các đội, giữ nguyên đội đầu tiên
    const lastTeamIndex = teamIndexes.pop();
    teamIndexes.splice(1, 0, lastTeamIndex);
  }

  // Tạo lịch lượt về bằng cách đảo ngược sân nhà/sân khách
  const returnFixtures = fixtures.map(fixture => ({
    round: fixture.round + numRounds,
    home: fixture.away,
    away: fixture.home,
  }));

  return [...fixtures, ...returnFixtures];
}