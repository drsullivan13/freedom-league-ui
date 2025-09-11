// UI Types matching the current team data structure

export interface TeamData {
  id: number;
  name: string;
  totalFPs: number;
  weekFPs: number;
  logo: string;
  record: string; // e.g., "5-4", "6-3"
  trend: "up" | "down";
  lastFourWeeks: number[]; // up to 4 weeks of freedom points data
}