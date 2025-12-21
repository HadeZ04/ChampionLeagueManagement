// import { MatchRecord } from "./matchService"; 

interface MatchSummary {
    homeTeamName: string;
    awayTeamName: string;
    homeScore: number | null;
    awayScore: number | null;
}

export class NotificationService {
    /**
     * Simulate sending a notification to all stakeholders about a match schedule change.
     */
    static async notifyMatchScheduleChange(
        match: any, // MatchRecord
        changes: {
            oldDate?: string; newDate?: string;
            oldStadium?: string; newStadium?: string;
        }
    ): Promise<void> {
        // In a real app, looking up subscribers, sending emails/push notifications, etc.
        console.log(`[NotificationService] 🔔 ALERT: Match ${match.homeTeamName} vs ${match.awayTeamName} changed!`);

        if (changes.newDate) {
            console.log(`[NotificationService] 📅 Date changed from ${changes.oldDate} to ${changes.newDate}`);
        }

        if (changes.newStadium) {
            console.log(`[NotificationService] 🏟️ Stadium moved from ${changes.oldStadium} to ${changes.newStadium}`);
        }

        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    static async notifyMatchResult(match: any): Promise<void> {
        console.log(`[NotificationService] ⚽ RESULT: ${match.homeTeamName} ${match.homeScore} - ${match.awayScore} ${match.awayTeamName}`);
    }
}
