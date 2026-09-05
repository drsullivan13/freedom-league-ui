import { ImageResponse } from "next/og"
import { getDashboardSnapshot } from "@/lib/server/freedomLeague"
import type { DashboardSnapshot } from "@/lib/types/api"

export const runtime = "nodejs"

const movementLabel = (movement: number) => {
  if (movement > 0) return `▲ ${movement}`
  if (movement < 0) return `▼ ${Math.abs(movement)}`
  return "—"
}

const renderRecap = (snapshot: DashboardSnapshot) =>
  new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#050b18",
            color: "#f8fafc",
            padding: "64px",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "18px",
                background: "#d91f2d",
                fontWeight: 900,
                fontSize: "28px",
              }}
            >
              FL
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: "24px", color: "#8fa6c9", letterSpacing: "5px" }}>
                TUESDAY RECAP
              </div>
              <div style={{ display: "flex", fontSize: "45px", fontWeight: 900, letterSpacing: "-2px" }}>
                NATIONAL FREEDOM LEAGUE
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderBottom: "2px solid #253653",
              padding: "48px 0 30px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: "22px", color: "#d91f2d", fontWeight: 800 }}>
                {`${snapshot.season} SEASON`}
              </div>
              <div style={{ display: "flex", fontSize: "76px", fontWeight: 900, letterSpacing: "-4px" }}>
                {`THROUGH WEEK ${snapshot.selectedWeek}`}
              </div>
            </div>
            <div style={{ display: "flex", fontSize: "22px", color: "#8fa6c9", paddingBottom: "12px" }}>
              FREEDOM POINTS
            </div>
          </div>

          <div
            style={{
              display: "flex",
              color: "#8fa6c9",
              fontSize: "18px",
              fontWeight: 700,
              padding: "22px 20px 15px",
            }}
          >
            <div style={{ display: "flex", width: "90px" }}>RANK</div>
            <div style={{ display: "flex", flex: 1 }}>TEAM</div>
            <div style={{ display: "flex", width: "110px", justifyContent: "center" }}>MOVE</div>
            <div style={{ display: "flex", width: "130px", justifyContent: "flex-end" }}>WEEK</div>
            <div style={{ display: "flex", width: "150px", justifyContent: "flex-end" }}>TOTAL</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            {snapshot.teams.map((team, index) => (
              <div
                key={team.teamId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "82px",
                  padding: "0 20px",
                  background: index === 0 ? "#13233d" : "#0b1425",
                  borderLeft: index === 0 ? "6px solid #d9ad3a" : "6px solid #253653",
                  borderRadius: "12px",
                }}
              >
                <div style={{ display: "flex", width: "90px", fontSize: "35px", fontWeight: 900 }}>
                  {team.rank}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: "29px", fontWeight: 800 }}>{team.name}</div>
                  <div style={{ display: "flex", color: "#8fa6c9", fontSize: "17px" }}>
                    {`${team.record.wins}-${team.record.losses}${team.record.ties ? `-${team.record.ties}` : ""}`}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "110px",
                    justifyContent: "center",
                    color: team.rankMovement > 0 ? "#54d6a1" : team.rankMovement < 0 ? "#ff7080" : "#8fa6c9",
                    fontSize: "22px",
                    fontWeight: 800,
                  }}
                >
                  {movementLabel(team.rankMovement)}
                </div>
                <div style={{ width: "130px", display: "flex", justifyContent: "flex-end", fontSize: "28px" }}>
                  {`+${team.weeklyFreedomPoints}`}
                </div>
                <div style={{ display: "flex", width: "150px", justifyContent: "flex-end", fontSize: "36px", fontWeight: 900 }}>
                  {team.totalFreedomPoints}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "28px",
              color: "#8fa6c9",
              fontSize: "18px",
            }}
          >
            <div style={{ display: "flex" }}>WEEKLY SCORE TIES DECIDED BY BENCH POINTS</div>
            <div style={{ display: "flex", color: "#f8fafc", fontWeight: 800 }}>SHARE THE FREEDOM</div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: Math.max(1350, 540 + snapshot.teams.length * 92),
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=900",
        },
      },
  )

const isValidSnapshot = (value: unknown): value is DashboardSnapshot => {
  if (!value || typeof value !== "object") return false
  const snapshot = value as Partial<DashboardSnapshot>
  return Number.isInteger(snapshot.season) &&
    Number.isInteger(snapshot.selectedWeek) &&
    Array.isArray(snapshot.teams) &&
    snapshot.teams.length > 0 &&
    snapshot.teams.length <= 20 &&
    snapshot.teams.every((team) =>
      typeof team?.teamId === "number" &&
      typeof team.name === "string" &&
      team.name.length <= 100 &&
      typeof team.rank === "number" &&
      typeof team.totalFreedomPoints === "number" &&
      typeof team.weeklyFreedomPoints === "number"
    )
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { snapshot?: unknown }
    if (!isValidSnapshot(payload.snapshot)) {
      return new Response("Invalid dashboard snapshot", { status: 400 })
    }
    return renderRecap(payload.snapshot)
  } catch {
    return new Response("Unable to generate recap", { status: 502 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const season = Number(searchParams.get("season"))
  const week = Number(searchParams.get("week"))

  if (!Number.isInteger(season) || !Number.isInteger(week)) {
    return new Response("Invalid season or week", { status: 400 })
  }

  try {
    return renderRecap(await getDashboardSnapshot(season, week))
  } catch {
    return new Response("Unable to generate recap", { status: 502 })
  }
}
