// API Response Types based on the endpoint specifications

export interface LeagueInfoResponse {
  data: Record<string, number>; // year: max_week pairs (e.g., { "2025": 2, "2024": 17 })
}

// Team data structure from API
export interface TeamWeekData {
  freedomPointsInWeek: number;
  totalFreedomPointsThroughWeek: number;
}

export interface FreedomStandingsResponse {
  data: {
    freedomPoints: Record<string, TeamWeekData>; // team_id: team_week_data
    weeklyFreedomPoints: Array<Record<string, TeamWeekData> | null>; // array of week data, null for empty weeks
  };
}

// Processed types for internal use
export interface LeagueInfo {
  availableSeasons: Record<string, number>; // year: max_week
}

export interface FreedomStandings {
  freedomPoints: Record<string, TeamWeekData>;
  weeklyFreedomPoints: Array<Record<string, TeamWeekData> | null>;
}