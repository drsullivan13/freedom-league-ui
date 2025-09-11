import { FreedomStandings, TeamWeekData } from '@/lib/types/api';
import { TeamData } from '@/lib/types/ui';

// Placeholder logos that match the current UI
const PLACEHOLDER_LOGOS = [
  "/lightning-bolt-logo.png",
  "/placeholder-fqsfz.png", 
  "/placeholder-t6pcg.png",
  "/placeholder-6f1o2.png",
  "/placeholder-y15id.png",
  "/placeholder-8ziwv.png",
  "/placeholder-dfy32.png",
  "/placeholder-vfo8r.png",
  "/placeholder-5rynh.png",
  "/placeholder-x5f34.png"
];

// Note: Team names are now dynamically retrieved from the API response

/**
 * Generate a consistent mock record based on team name and selected week
 * The record should be realistic (wins + losses = week - 1)
 */
function generateMockRecord(teamName: string, selectedWeek: number): string {
  if (selectedWeek <= 1) return "0-0";
  
  // Use a simple hash of the team name for consistency
  const hash = teamName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const totalGames = selectedWeek - 1;
  
  // Generate wins between 0 and totalGames based on hash
  const wins = Math.floor((hash % 100) / 100 * (totalGames + 1));
  const losses = totalGames - wins;
  
  return `${wins}-${losses}`;
}

/**
 * Get last four weeks of data for sparkline, up to the selected week
 */
function getLastFourWeeks(
  weeklyData: Array<Record<string, TeamWeekData> | null>,
  teamId: string,
  selectedWeek: number
): number[] {
  const weeks: number[] = [];
  const startWeek = Math.max(0, selectedWeek - 4);
  
  for (let i = startWeek; i < selectedWeek; i++) {
    const weekData = weeklyData[i];
    if (weekData && weekData[teamId] !== undefined) {
      weeks.push(weekData[teamId].freedomPointsInWeek || 0);
    } else {
      weeks.push(0); // Default to 0 if no data
    }
  }
  
  return weeks;
}

/**
 * Calculate trend by comparing last 2 weeks
 */
function calculateTrend(lastFourWeeks: number[]): "up" | "down" {
  if (lastFourWeeks.length < 2) return "down";
  
  const lastWeek = lastFourWeeks[lastFourWeeks.length - 1];
  const previousWeek = lastFourWeeks[lastFourWeeks.length - 2];
  
  return lastWeek >= previousWeek ? "up" : "down";
}

/**
 * Get the last week that has actual data (not empty object)
 */
export function getLastWeekWithData(weeklyFreedomPoints: Array<Record<string, TeamWeekData> | null>): number {
  for (let i = weeklyFreedomPoints.length - 1; i >= 0; i--) {
    const weekData = weeklyFreedomPoints[i];
    // Check if the week has data (not null, not empty object)
    if (weekData && Object.keys(weekData).length > 0) {
      return i + 1; // Convert back to 1-indexed
    }
  }
  return 1; // Default to week 1 if no data found
}

/**
 * Check if a specific week has data
 */
export function hasWeekData(weeklyFreedomPoints: Array<Record<string, TeamWeekData> | null>, week: number): boolean {
  const weekIndex = week - 1;
  const weekData = weeklyFreedomPoints[weekIndex];
  return weekData !== null && weekData !== undefined && Object.keys(weekData).length > 0;
}

/**
 * Transform API response to TeamData array for UI consumption
 */
export function transformAPIResponseToTeamData(
  apiResponse: FreedomStandings,
  selectedWeek: number
): TeamData[] {
  const { freedomPoints, weeklyFreedomPoints } = apiResponse;
  
  // Get team IDs from freedomPoints
  const teamIds = Object.keys(freedomPoints);
  
  // Check if the selected week has data
  if (!hasWeekData(weeklyFreedomPoints, selectedWeek)) {
    // If no data for selected week, return empty array
    return [];
  }
  
  return teamIds.map((teamId, index) => {
    // Get week FPs for the selected week (weeks are 1-indexed, array is 0-indexed)
    const weekIndex = selectedWeek - 1;
    const weekData = weeklyFreedomPoints[weekIndex];
    const weekFPs = weekData && weekData[teamId] ? weekData[teamId].freedomPointsInWeek || 0 : 0;
    
    // Get last four weeks data for sparkline
    const lastFourWeeks = getLastFourWeeks(weeklyFreedomPoints, teamId, selectedWeek);
    
    // Calculate trend
    const trend = calculateTrend(lastFourWeeks);
    
    // Generate mock record using the actual team name from API
    const record = generateMockRecord(teamId, selectedWeek);
    
    // Get total FPs from the selected week data (totalFreedomPointsThroughWeek)
    const totalFPs = weekData && weekData[teamId] ? weekData[teamId].totalFreedomPointsThroughWeek || 0 : 0;
    
    return {
      id: index + 1, // Incremental ID
      name: teamId, // Use actual team name from API
      totalFPs,
      weekFPs,
      logo: PLACEHOLDER_LOGOS[index % PLACEHOLDER_LOGOS.length], // Cycle through logos
      record,
      trend,
      lastFourWeeks
    };
  }); // No need to filter since all teams from API have names
}