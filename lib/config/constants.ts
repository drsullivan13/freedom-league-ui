export const LEAGUE_CONFIG = {
  leagueType: 'football',
  leagueId: '248873'
} as const;

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
} as const;