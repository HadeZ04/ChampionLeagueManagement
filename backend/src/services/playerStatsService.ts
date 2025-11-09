import { randomUUID } from "crypto";

export type PlayerStatCategory = "goals" | "assists" | "clean-sheets" | "minutes";
export type AllowedSeason = "2023-2024" | "2024-2025" | "2025-2026";

export type PlayerRecentMatch = {
  opponent: string;
  result: string;
  contribution: string;
};

export interface PlayerStat {
  id: string;
  category: PlayerStatCategory;
  rank: number;
  player: string;
  team: string;
  teamLogo: string;
  value: number;
  matches: number;
  season: AllowedSeason;
  position?: string | null;
  nationality?: string | null;
  age?: number | null;
  avatar?: string | null;
  bio?: string | null;
  preferredFoot?: string | null;
  height?: string | null;
  recentMatches?: PlayerRecentMatch[];
}

const ALLOWED_SEASONS: AllowedSeason[] = ["2023-2024", "2024-2025", "2025-2026"];
const DEFAULT_SEASON: AllowedSeason = "2025-2026";

const ensureSeason = (season?: string): AllowedSeason =>
  ALLOWED_SEASONS.includes(season as AllowedSeason) ? (season as AllowedSeason) : DEFAULT_SEASON;

const defaultStats: PlayerStat[] = [
  {
    id: randomUUID(),
    category: "goals",
    rank: 1,
    player: "Robert Lewandowski",
    team: "Barcelona",
    teamLogo: "BAR",
    value: 7,
    matches: 6,
    season: "2025-2026",
    position: "Forward",
    nationality: "Poland",
    age: 36,
    avatar: "https://img.uefa.com/imgml/TP/players/1/2024/324x324/63706.jpg",
    preferredFoot: "Right",
    height: "185 cm",
    bio: "Clinical striker with incredible positioning and leadership for Barcelona.",
    recentMatches: [
      { opponent: "Real Madrid", result: "3-2 W", contribution: "2 goals" },
      { opponent: "Bayern Munich", result: "1-1 D", contribution: "1 goal" },
      { opponent: "Arsenal", result: "2-0 W", contribution: "Assist" },
    ],
  },
  {
    id: randomUUID(),
    category: "goals",
    rank: 2,
    player: "Viktor Gyökeres",
    team: "Sporting CP",
    teamLogo: "SCP",
    value: 5,
    matches: 6,
    season: "2025-2026",
    position: "Forward",
    nationality: "Sweden",
    age: 27,
    avatar: "https://img.uefa.com/imgml/TP/players/1/2024/324x324/250104591.jpg",
    preferredFoot: "Right",
    height: "187 cm",
    bio: "Powerful runner with relentless pressing and composed finishing.",
    recentMatches: [
      { opponent: "Benfica", result: "2-2 D", contribution: "1 goal" },
      { opponent: "Porto", result: "1-0 W", contribution: "Match-winning goal" },
      { opponent: "Ajax", result: "0-1 L", contribution: "Created 3 chances" },
    ],
  },
  {
    id: randomUUID(),
    category: "assists",
    rank: 1,
    player: "Raphinha",
    team: "Barcelona",
    teamLogo: "BAR",
    value: 4,
    matches: 6,
    season: "2025-2026",
    position: "Winger",
    nationality: "Brazil",
    age: 29,
    avatar: "https://img.uefa.com/imgml/TP/players/1/2024/324x324/250124210.jpg",
    preferredFoot: "Left",
    height: "176 cm",
    bio: "Explosive winger who stretches defenses and delivers clinical final balls.",
    recentMatches: [
      { opponent: "Real Madrid", result: "3-2 W", contribution: "2 assists" },
      { opponent: "Napoli", result: "2-1 W", contribution: "Goal + assist" },
      { opponent: "Inter", result: "1-1 D", contribution: "4 key passes" },
    ],
  },
  {
    id: randomUUID(),
    category: "assists",
    rank: 2,
    player: "Mohamed Salah",
    team: "Liverpool",
    teamLogo: "LIV",
    value: 3,
    matches: 6,
    season: "2025-2026",
    position: "Forward",
    nationality: "Egypt",
    age: 33,
    avatar: "https://img.uefa.com/imgml/TP/players/1/2024/324x324/250008726.jpg",
    preferredFoot: "Left",
    height: "175 cm",
    bio: "Liverpool talisman combining pace, power, and intelligent playmaking.",
    recentMatches: [
      { opponent: "Man City", result: "2-2 D", contribution: "2 assists" },
      { opponent: "Chelsea", result: "1-0 W", contribution: "Assist" },
      { opponent: "PSG", result: "0-0 D", contribution: "5 shots on target" },
    ],
  },
  {
    id: randomUUID(),
    category: "clean-sheets",
    rank: 1,
    player: "Caoimhín Kelleher",
    team: "Liverpool",
    teamLogo: "LIV",
    value: 5,
    matches: 6,
    season: "2025-2026",
    position: "Goalkeeper",
    nationality: "Ireland",
    age: 26,
    avatar: "https://img.uefa.com/imgml/TP/players/1/2024/324x324/250099269.jpg",
    preferredFoot: "Right",
    height: "188 cm",
    bio: "Calm shot-stopper emerging as Liverpool’s secure pair of hands in Europe.",
    recentMatches: [
      { opponent: "AC Milan", result: "2-0 W", contribution: "7 saves" },
      { opponent: "Ajax", result: "1-0 W", contribution: "Clean sheet" },
      { opponent: "Real Sociedad", result: "0-0 D", contribution: "Penalty save" },
    ],
  },
  {
    id: randomUUID(),
    category: "clean-sheets",
    rank: 2,
    player: "Yann Sommer",
    team: "Inter",
    teamLogo: "INT",
    value: 4,
    matches: 6,
    season: "2025-2026",
    position: "Goalkeeper",
    nationality: "Switzerland",
    age: 36,
    avatar: "https://img.uefa.com/imgml/TP/players/1/2024/324x324/19070.jpg",
    preferredFoot: "Right",
    height: "183 cm",
    bio: "Veteran with lightning reflexes anchoring Inter’s resilient defense.",
    recentMatches: [
      { opponent: "Juventus", result: "1-0 W", contribution: "Clean sheet" },
      { opponent: "Barcelona", result: "1-1 D", contribution: "8 saves" },
      { opponent: "Napoli", result: "2-0 W", contribution: "Commanded area" },
    ],
  },
  {
    id: randomUUID(),
    category: "minutes",
    rank: 1,
    player: "Virgil van Dijk",
    team: "Liverpool",
    teamLogo: "LIV",
    value: 540,
    matches: 6,
    season: "2025-2026",
    position: "Defender",
    nationality: "Netherlands",
    age: 34,
    avatar: "https://img.uefa.com/imgml/TP/players/1/2024/324x324/250035473.jpg",
    preferredFoot: "Right",
    height: "193 cm",
    bio: "Dominant centre-back providing leadership and composure at the back.",
    recentMatches: [
      { opponent: "PSV", result: "2-0 W", contribution: "MOTM" },
      { opponent: "Arsenal", result: "1-0 W", contribution: "90% pass accuracy" },
      { opponent: "Real Madrid", result: "1-1 D", contribution: "9 clearances" },
    ],
  },
  {
    id: randomUUID(),
    category: "minutes",
    rank: 2,
    player: "William Saliba",
    team: "Arsenal",
    teamLogo: "ARS",
    value: 540,
    matches: 6,
    season: "2025-2026",
    position: "Defender",
    nationality: "France",
    age: 24,
    avatar: "https://img.uefa.com/imgml/TP/players/1/2024/324x324/250138425.jpg",
    preferredFoot: "Right",
    height: "192 cm",
    bio: "Composed defender with elite anticipation and ball-playing ability.",
    recentMatches: [
      { opponent: "Bayern Munich", result: "0-0 D", contribution: "8 interceptions" },
      { opponent: "Juventus", result: "2-1 W", contribution: "Assist" },
      { opponent: "Porto", result: "1-0 W", contribution: "Clean sheet" },
    ],
  },
];

const statsStore: PlayerStat[] = [...defaultStats];

const normalizeRank = (category: PlayerStatCategory, rank?: number): number => {
  if (rank && Number.isFinite(rank) && rank > 0) {
    return rank;
  }
  const currentMax = Math.max(
    0,
    ...statsStore.filter((stat) => stat.category === category).map((stat) => stat.rank),
  );
  return currentMax + 1;
};

const groupByCategory = (entries: PlayerStat[]) => {
  return entries.reduce<Record<PlayerStatCategory, PlayerStat[]>>(
    (acc, entry) => {
      acc[entry.category] = acc[entry.category] ?? [];
      acc[entry.category].push(entry);
      acc[entry.category].sort((a, b) => a.rank - b.rank);
      return acc;
    },
    {
      goals: [],
      assists: [],
      "clean-sheets": [],
      minutes: [],
    },
  );
};

export async function listPlayerStats(
  season?: string,
  category?: PlayerStatCategory,
): Promise<Record<PlayerStatCategory, PlayerStat[]>> {
  const resolvedSeason = ensureSeason(season);
  const filtered = statsStore.filter(
    (stat) => stat.season === resolvedSeason && (!category || stat.category === category),
  );
  return groupByCategory(filtered);
}

interface PlayerStatPayload {
  category?: PlayerStatCategory | string;
  rank?: number;
  player?: string;
  team?: string;
  teamLogo?: string;
  value?: number;
  matches?: number;
  season?: string;
  position?: string;
  nationality?: string;
  age?: number;
  avatar?: string;
  bio?: string;
  preferredFoot?: string;
  height?: string;
  recentMatches?: PlayerRecentMatch[];
}

const sanitizeCategory = (category?: string): PlayerStatCategory => {
  switch (category) {
    case "assists":
    case "clean-sheets":
    case "minutes":
      return category;
    default:
      return "goals";
  }
};

export async function addPlayerStat(payload: PlayerStatPayload): Promise<PlayerStat> {
  const category = sanitizeCategory(payload.category);
  const player = typeof payload.player === "string" ? payload.player.trim() : "";
  const team = typeof payload.team === "string" ? payload.team.trim() : "";
  const teamLogo = typeof payload.teamLogo === "string" ? payload.teamLogo.trim() : team.slice(0, 3).toUpperCase();

  if (!player) {
    throw new Error("Player name is required");
  }
  if (!team) {
    throw new Error("Team name is required");
  }

  const newEntry: PlayerStat = {
    id: randomUUID(),
    category,
    rank: normalizeRank(category, payload.rank),
    player,
    team,
    teamLogo: teamLogo || team.slice(0, 3).toUpperCase(),
    value: Number(payload.value) || 0,
    matches: Number(payload.matches) || 0,
    season: ensureSeason(payload.season),
    position: payload.position ?? null,
    nationality: payload.nationality ?? null,
    age: payload.age ?? null,
    avatar: payload.avatar ?? null,
    bio: payload.bio ?? null,
    preferredFoot: payload.preferredFoot ?? null,
    height: payload.height ?? null,
    recentMatches: payload.recentMatches ?? [],
  };

  statsStore.push(newEntry);
  return newEntry;
}

export async function updatePlayerStat(id: string, payload: PlayerStatPayload): Promise<PlayerStat | null> {
  const index = statsStore.findIndex((stat) => stat.id === id);
  if (index === -1) {
    return null;
  }

  const existing = statsStore[index];
  const updatedCategory = payload.category ? sanitizeCategory(payload.category) : existing.category;

  const updated: PlayerStat = {
    ...existing,
    category: updatedCategory,
    rank: payload.rank && Number.isFinite(payload.rank) ? Number(payload.rank) : existing.rank,
    player:
      typeof payload.player === "string" && payload.player.trim() ? payload.player.trim() : existing.player,
    team: typeof payload.team === "string" && payload.team.trim() ? payload.team.trim() : existing.team,
    teamLogo:
      typeof payload.teamLogo === "string" && payload.teamLogo.trim()
        ? payload.teamLogo.trim()
        : existing.teamLogo,
    value:
      payload.value !== undefined && Number.isFinite(Number(payload.value))
        ? Number(payload.value)
        : existing.value,
    matches:
      payload.matches !== undefined && Number.isFinite(Number(payload.matches))
        ? Number(payload.matches)
        : existing.matches,
    season: payload.season ? ensureSeason(payload.season) : existing.season,
    position: payload.position ?? existing.position,
    nationality: payload.nationality ?? existing.nationality,
    age: payload.age ?? existing.age,
    avatar: payload.avatar ?? existing.avatar,
    bio: payload.bio ?? existing.bio,
    preferredFoot: payload.preferredFoot ?? existing.preferredFoot,
    height: payload.height ?? existing.height,
    recentMatches: payload.recentMatches ?? existing.recentMatches,
  };

  statsStore[index] = updated;
  return updated;
}

export async function deletePlayerStat(id: string): Promise<boolean> {
  const index = statsStore.findIndex((stat) => stat.id === id);
  if (index === -1) {
    return false;
  }
  statsStore.splice(index, 1);
  return true;
}

export async function getPlayerStatDetail(id: string): Promise<PlayerStat | null> {
  const entry = statsStore.find((stat) => stat.id === id);
  if (!entry) {
    return null;
  }
  return entry;
}
