import type { DashboardSnapshot, LeagueInfo } from "@/lib/types/api"

const getApiConfig = () => ({
  baseUrl:
    process.env.FANTASY_SPORTS_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5001",
  leagueType: process.env.LEAGUE_TYPE ?? "football",
  leagueId: process.env.LEAGUE_ID ?? "248873",
})

const fetchJson = async <T>(path: string, revalidate: number): Promise<T> => {
  const { baseUrl } = getApiConfig()
  const response = await fetch(`${baseUrl}${path}`, {
    next: { revalidate },
    signal: AbortSignal.timeout(12000),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `League API returned ${response.status}`)
  }

  const payload = (await response.json()) as { data?: T }
  if (!payload.data) throw new Error("League API returned an invalid response")
  return payload.data
}

export const getDashboardSnapshot = async (
  season: number,
  week?: number,
): Promise<DashboardSnapshot> => {
  const { leagueType, leagueId } = getApiConfig()
  const query = week ? `?week=${week}` : ""
  return fetchJson(
    `/results/${leagueType}/${leagueId}/dashboard/${season}${query}`,
    300,
  )
}

export const getLeagueInfo = async (): Promise<LeagueInfo> => {
  const { leagueType, leagueId } = getApiConfig()
  const info = await fetchJson<Record<string, number | null>>(
    `/leagueInfo?leagueType=${leagueType}&leagueId=${leagueId}`,
    3600,
  )

  return {
    availableSeasons: Object.keys(info)
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => b - a),
  }
}
