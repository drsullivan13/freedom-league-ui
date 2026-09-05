import { NextResponse } from "next/server"
import { getDashboardSnapshot } from "@/lib/server/freedomLeague"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const season = Number(searchParams.get("season"))
  const weekParam = searchParams.get("week")
  const week = weekParam ? Number(weekParam) : undefined

  if (!Number.isInteger(season) || (week != null && !Number.isInteger(week))) {
    return NextResponse.json({ error: "Invalid season or week" }, { status: 400 })
  }

  try {
    const data = await getDashboardSnapshot(season, week)
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load standings" },
      { status: 502 },
    )
  }
}
