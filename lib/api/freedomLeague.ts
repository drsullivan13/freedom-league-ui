import { LEAGUE_CONFIG, API_CONFIG } from '@/lib/config/constants';
import { LeagueInfoResponse, FreedomStandingsResponse, LeagueInfo, FreedomStandings } from '@/lib/types/api';

// Custom error class for API errors
export class FreedomLeagueAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'FreedomLeagueAPIError';
  }
}

/**
 * Fetch league information including available seasons and their max weeks
 */
export async function fetchLeagueInfo(): Promise<LeagueInfo> {
  try {
    const url = `${API_CONFIG.baseUrl}/leagueInfo?leagueType=${LEAGUE_CONFIG.leagueType}&leagueId=${LEAGUE_CONFIG.leagueId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new FreedomLeagueAPIError(
        `Failed to fetch league info: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: LeagueInfoResponse = await response.json();
    
    if (!data.data || typeof data.data !== 'object') {
      throw new FreedomLeagueAPIError('Invalid league info response format');
    }

    return {
      availableSeasons: data.data
    };
  } catch (error) {
    if (error instanceof FreedomLeagueAPIError) {
      throw error;
    }
    
    // Handle network errors, CORS issues, etc.
    throw new FreedomLeagueAPIError(
      `Network error while fetching league info: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fetch freedom standings data for a specific year
 */
export async function fetchFreedomStandings(year: string): Promise<FreedomStandings> {
  try {
    const url = `${API_CONFIG.baseUrl}/results/${LEAGUE_CONFIG.leagueType}/${LEAGUE_CONFIG.leagueId}/freedomStandings/${year}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new FreedomLeagueAPIError(
        `Failed to fetch freedom standings for ${year}: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: FreedomStandingsResponse = await response.json();
    
    if (!data.data || typeof data.data !== 'object') {
      throw new FreedomLeagueAPIError('Invalid freedom standings response format');
    }

    if (!data.data.freedomPoints || !Array.isArray(data.data.weeklyFreedomPoints)) {
      throw new FreedomLeagueAPIError('Missing required fields in freedom standings response');
    }

    return {
      freedomPoints: data.data.freedomPoints,
      weeklyFreedomPoints: data.data.weeklyFreedomPoints
    };
  } catch (error) {
    if (error instanceof FreedomLeagueAPIError) {
      throw error;
    }
    
    // Handle network errors, CORS issues, etc.
    throw new FreedomLeagueAPIError(
      `Network error while fetching freedom standings: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}