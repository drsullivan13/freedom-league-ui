export interface TeamRecord {
  wins: number
  losses: number
  ties: number
}

export interface WeeklyFreedomPoint {
  week: number
  freedomPoints: number
}

export interface DashboardTeam {
  teamId: number
  name: string
  abbreviation: string
  logoUrl: string | null
  record: TeamRecord
  fantasyPoints: number
  benchPoints: number | null
  weeklyFreedomPoints: number
  totalFreedomPoints: number
  weeklyHistory: WeeklyFreedomPoint[]
  rank: number
  previousRank: number
  rankMovement: number
}

export interface DashboardSnapshot {
  league: {
    id: string
    name: string
  }
  season: number
  selectedWeek: number
  latestCompletedWeek: number | null
  availableWeeks: number[]
  isWeekComplete: boolean
  isScoringResolved: boolean
  unresolvedTeamIds: number[]
  updatedAt: string
  teams: DashboardTeam[]
}

export interface LeagueInfo {
  availableSeasons: number[]
}
