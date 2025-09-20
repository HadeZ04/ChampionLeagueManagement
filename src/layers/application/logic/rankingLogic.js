// Ví dụ về logic tính toán ở backend (Node.js)

/**
 * Tính toán và sắp xếp bảng xếp hạng từ danh sách trận đấu
 * @param {Array} teams - Danh sách các đội
 * @param {Array} matches - Tất cả các trận đấu đã diễn ra của mùa giải
 * @param {Array<string>} tiebreakerRules - Mảng quy tắc ưu tiên (ví dụ: ['POINTS', 'HEAD_TO_HEAD', 'GOAL_DIFFERENCE'])
 * @returns {Array} Bảng xếp hạng đã được sắp xếp
 */
function calculateStandings(teams, matches, tiebreakerRules) {
    // 1. Tính toán các chỉ số cơ bản cho mỗi đội
    const stats = teams.map(team => {
        const teamMatches = matches.filter(m => m.home_team_id === team.id || m.away_team_id === team.id);
        let points = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;
        
        teamMatches.forEach(m => {
            if (m.home_team_id === team.id) { // Team is home
                gf += m.home_score;
                ga += m.away_score;
                if (m.home_score > m.away_score) { points += 3; won++; }
                else if (m.home_score === m.away_score) { points += 1; drawn++; }
                else { lost++; }
            } else { // Team is away
                gf += m.away_score;
                ga += m.home_score;
                if (m.away_score > m.home_score) { points += 3; won++; }
                else if (m.away_score === m.home_score) { points += 1; drawn++; }
                else { lost++; }
            }
        });
        
        return {
            ...team,
            played: teamMatches.length,
            points, won, drawn, lost,
            goalsFor: gf,
            goalsAgainst: ga,
            goalDifference: gf - ga,
        };
    });

    // 2. Sắp xếp danh sách theo các quy tắc tiebreaker
    stats.sort((a, b) => {
        for (const rule of tiebreakerRules) {
            let comparison = 0;
            switch (rule) {
                case 'POINTS':
                    comparison = b.points - a.points;
                    break;
                case 'GOAL_DIFFERENCE':
                    comparison = b.goalDifference - a.goalDifference;
                    break;
                case 'GOALS_FOR':
                    comparison = b.goalsFor - a.goalsFor;
                    break;
                case 'HEAD_TO_HEAD':
                    // Logic đối đầu phức tạp sẽ được xử lý ở đây.
                    // Nó sẽ lọc ra các trận chỉ giữa a và b, sau đó tính toán lại điểm/hiệu số...
                    // và gọi lại hàm sắp xếp này một cách đệ quy chỉ với 2 đội đó.
                    break;
            }
            if (comparison !== 0) return comparison;
        }
        return 0; // Bằng nhau trên mọi chỉ số
    });

    // 3. Gán vị trí cuối cùng
    return stats.map((team, index) => ({ ...team, position: index + 1 }));
}