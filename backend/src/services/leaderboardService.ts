import { randomUUID } from "crypto";

export type AllowedSeason = "2023-2024" | "2024-2025" | "2025-2026";

export type LeaderboardBadge = "Legend" | "Master" | "Expert" | "Pro";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  points: number;
  country: string;
  badge: LeaderboardBadge;
  season: AllowedSeason;
}

const ALLOWED_SEASONS: AllowedSeason[] = ["2023-2024", "2024-2025", "2025-2026"];
const DEFAULT_SEASON: AllowedSeason = "2025-2026";

const ensureSeason = (season?: string): AllowedSeason => {
  if (season && ALLOWED_SEASONS.includes(season as AllowedSeason)) {
    return season as AllowedSeason;
  }
  return DEFAULT_SEASON;
};

const sanitizeBadge = (badge?: string): LeaderboardBadge => {
  switch (badge) {
    case "Legend":
    case "Master":
    case "Expert":
      return badge;
    default:
      return "Pro";
  }
};

const baseEntries: LeaderboardEntry[] = [
  {
    id: randomUUID(),
    rank: 1,
    username: "ChampionsKing",
    points: 2847,
    country: "Spain",
    badge: "Legend",
    season: "2025-2026",
  },
  {
    id: randomUUID(),
    rank: 2,
    username: "BarcaFan2024",
    points: 2756,
    country: "Spain",
    badge: "Master",
    season: "2025-2026",
  },
  {
    id: randomUUID(),
    rank: 3,
    username: "LiverpoolLegend",
    points: 2689,
    country: "England",
    badge: "Master",
    season: "2025-2026",
  },
  {
    id: randomUUID(),
    rank: 4,
    username: "InterMilan",
    points: 2634,
    country: "Italy",
    badge: "Expert",
    season: "2025-2026",
  },
  {
    id: randomUUID(),
    rank: 5,
    username: "BayernMunich",
    points: 2587,
    country: "Germany",
    badge: "Expert",
    season: "2025-2026",
  },
];

const leaderboardStore: LeaderboardEntry[] = [...baseEntries];

const sortLeaderboard = (): void => {
  leaderboardStore.sort((a, b) => {
    if (a.season === b.season) {
      const rankCompare = a.rank - b.rank;
      return rankCompare !== 0 ? rankCompare : b.points - a.points;
    }
    return ALLOWED_SEASONS.indexOf(a.season) - ALLOWED_SEASONS.indexOf(b.season);
  });
};

export async function listLeaderboardEntries(season?: string): Promise<LeaderboardEntry[]> {
  const resolvedSeason = ensureSeason(season);
  sortLeaderboard();
  return leaderboardStore
    .filter((entry) => entry.season === resolvedSeason)
    .sort((a, b) => a.rank - b.rank || b.points - a.points);
}

interface LeaderboardPayload {
  rank?: number;
  username?: string;
  points?: number;
  country?: string;
  badge?: LeaderboardBadge | string;
  season?: string;
}

export async function addLeaderboardEntry(payload: LeaderboardPayload): Promise<LeaderboardEntry> {
  const rank = Number(payload.rank);
  const points = Number(payload.points);
  const username = typeof payload.username === "string" ? payload.username.trim() : "";
  const country = typeof payload.country === "string" ? payload.country.trim() : "";
  const season = ensureSeason(payload.season);

  if (!username) {
    throw new Error("Username is required");
  }
  if (!Number.isFinite(points)) {
    throw new Error("Points must be a valid number");
  }

  const newEntry: LeaderboardEntry = {
    id: randomUUID(),
    rank: Number.isFinite(rank) && rank > 0 ? rank : leaderboardStore.length + 1,
    username,
    points,
    country: country || "Unknown",
    badge: sanitizeBadge(payload.badge),
    season,
  };

  leaderboardStore.push(newEntry);
  sortLeaderboard();
  return newEntry;
}

export async function updateLeaderboardEntry(
  id: string,
  payload: LeaderboardPayload,
): Promise<LeaderboardEntry | null> {
  const index = leaderboardStore.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return null;
  }

  const existing = leaderboardStore[index];
  const nextSeason = payload.season ? ensureSeason(payload.season) : existing.season;

  const updated: LeaderboardEntry = {
    ...existing,
    rank:
      payload.rank !== undefined && Number.isFinite(Number(payload.rank))
        ? Number(payload.rank)
        : existing.rank,
    username:
      typeof payload.username === "string" && payload.username.trim()
        ? payload.username.trim()
        : existing.username,
    points:
      payload.points !== undefined && Number.isFinite(Number(payload.points))
        ? Number(payload.points)
        : existing.points,
    country:
      typeof payload.country === "string" && payload.country.trim()
        ? payload.country.trim()
        : existing.country,
    badge: payload.badge ? sanitizeBadge(payload.badge) : existing.badge,
    season: nextSeason,
  };

  leaderboardStore[index] = updated;
  sortLeaderboard();
  return updated;
}

export async function deleteLeaderboardEntry(id: string): Promise<boolean> {
  const index = leaderboardStore.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  leaderboardStore.splice(index, 1);
  sortLeaderboard();
  return true;
}
