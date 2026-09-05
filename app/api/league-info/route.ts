import { NextResponse } from "next/server"
import { getLeagueInfo } from "@/lib/server/freedomLeague"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json({ data: await getLeagueInfo() })
  } catch {
    const today = new Date()
    const currentSeason = today.getMonth() < 6
      ? today.getFullYear() - 1
      : today.getFullYear()
    return NextResponse.json({
      data: { availableSeasons: [currentSeason] },
      degraded: true,
    })
  }
}
