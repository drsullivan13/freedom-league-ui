"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Award,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Gauge,
  Medal,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { DashboardSnapshot, DashboardTeam, LeagueInfo } from "@/lib/types/api"

type ViewMode = "standings" | "weekly" | "records"

const currentYear = new Date().getFullYear()

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

const formatRecord = (team: DashboardTeam) =>
  `${team.record.wins}-${team.record.losses}${team.record.ties ? `-${team.record.ties}` : ""}`

const secureLogoUrl = (logoUrl: string | null) => {
  if (!logoUrl) return null

  try {
    const url = new URL(logoUrl)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

const Movement = ({ value, compact = false }: { value: number; compact?: boolean }) => {
  if (value === 0) {
    return <span className="movement movement-flat" aria-label="No rank movement">—</span>
  }

  const Icon = value > 0 ? ArrowUp : ArrowDown

  return (
    <span
      className={`movement ${value > 0 ? "movement-up" : "movement-down"}`}
      aria-label={`${Math.abs(value)} place${Math.abs(value) === 1 ? "" : "s"} ${value > 0 ? "up" : "down"}`}
    >
      <Icon aria-hidden="true" className={compact ? "size-3" : "size-4"} />
      {Math.abs(value)}
    </span>
  )
}

const TeamMark = ({ team, size = "default" }: { team: DashboardTeam; size?: "default" | "large" }) => {
  const logoUrl = secureLogoUrl(team.logoUrl)

  return (
    <Avatar className={size === "large" ? "size-16 border-2 border-white/15" : "size-11 border border-white/10"}>
      {logoUrl ? <AvatarImage src={logoUrl} alt="" /> : null}
      <AvatarFallback className="bg-[#182844] text-xs font-black tracking-wider text-white">
        {initials(team.name)}
      </AvatarFallback>
    </Avatar>
  )
}

const ScoreSparkline = ({ team }: { team: DashboardTeam }) => {
  const values = team.weeklyHistory.slice(-6).map((entry) => entry.freedomPoints)
  const max = Math.max(...values, 1)

  return (
    <div className="sparkline" aria-label={`Recent Freedom Points: ${values.join(", ")}`}>
      {values.map((value, index) => (
        <span
          key={`${team.teamId}-${index}`}
          style={{ height: `${Math.max(18, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

const fetchData = async <T,>(url: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal })
  const payload = (await response.json()) as { data?: T; error?: string }
  if (!response.ok || !payload.data) throw new Error(payload.error ?? "Unable to load league data")
  return payload.data
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function LeagueDashboard() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [seasons, setSeasons] = useState<number[]>([currentYear])
  const [selectedSeason, setSelectedSeason] = useState(currentYear)
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>()
  const [view, setView] = useState<ViewMode>("standings")
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareAsset, setShareAsset] = useState<{ key: string; blob: Blob } | null>(null)
  const [shareError, setShareError] = useState<{ key: string; message: string } | null>(null)
  const [shareRetry, setShareRetry] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const requestId = useRef(0)

  const loadSnapshot = useCallback(async (season: number, week?: number, signal?: AbortSignal) => {
    const activeRequest = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams({ season: String(season) })
      if (week) query.set("week", String(week))
      const data = await fetchData<DashboardSnapshot>(`/api/dashboard?${query}`, signal)
      if (activeRequest !== requestId.current) return
      setSnapshot(data)
      setSelectedSeason(data.season)
      setSelectedWeek(data.selectedWeek)
      const url = new URL(window.location.href)
      url.searchParams.set("season", String(data.season))
      url.searchParams.set("week", String(data.selectedWeek))
      window.history.replaceState({}, "", url)
      return true
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return false
      if (activeRequest !== requestId.current) return false
      setError(loadError instanceof Error ? loadError.message : "Unable to load standings")
      return false
    } finally {
      if (!signal?.aborted && activeRequest === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetchData<LeagueInfo>("/api/league-info", controller.signal)
      .then(async (data) => {
        setSeasons(data.availableSeasons.length ? data.availableSeasons : [currentYear])
        const params = new URLSearchParams(window.location.search)
        const requestedSeason = Number(params.get("season"))
        const requestedWeek = Number(params.get("week"))
        const hasRequestedSeason = params.has("season") && data.availableSeasons.includes(requestedSeason)
        const initialSeason = data.availableSeasons.includes(requestedSeason)
          ? requestedSeason
          : data.availableSeasons[0] ?? currentYear
        setSelectedSeason(initialSeason)
        if (hasRequestedSeason) {
          return loadSnapshot(
            initialSeason,
            Number.isInteger(requestedWeek) && requestedWeek > 0 ? requestedWeek : undefined,
            controller.signal,
          )
        }

        for (const season of data.availableSeasons) {
          if (await loadSnapshot(season, undefined, controller.signal)) return true
        }
        return false
      })
      .catch((loadError) => {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return
        void loadSnapshot(currentYear, undefined, controller.signal)
      })
    return () => controller.abort()
  }, [loadSnapshot])

  useEffect(() => {
    if (!snapshot) return
    const controller = new AbortController()
    const key = `${snapshot.season}-${snapshot.selectedWeek}`
    void fetch("/api/recap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot }),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Recap unavailable")
        return response.blob()
      })
      .then((blob) => {
        setShareAsset({ key, blob })
        setShareError((current) => current?.key === key ? null : current)
      })
      .catch((shareError) => {
        if (shareError instanceof DOMException && shareError.name === "AbortError") return
        setShareError({ key, message: "Recap image unavailable" })
      })
    return () => controller.abort()
  }, [snapshot, shareRetry])

  const shareKey = snapshot ? `${snapshot.season}-${snapshot.selectedWeek}` : null
  const shareBlob = shareAsset?.key === shareKey ? shareAsset.blob : null
  const recapFailed = shareError?.key === shareKey
  const shareLoading = Boolean(snapshot && !shareBlob && !recapFailed)

  const displayTeams = useMemo(() => {
    if (!snapshot) return []
    return view === "weekly"
      ? [...snapshot.teams].sort(
          (a, b) => b.weeklyFreedomPoints - a.weeklyFreedomPoints || a.rank - b.rank,
        )
      : snapshot.teams
  }, [snapshot, view])

  const highlights = useMemo(() => snapshot?.teams.reduce(
    (result, team) => ({
      weeklyWinner: team.weeklyFreedomPoints > result.weeklyWinner.weeklyFreedomPoints
        ? team
        : result.weeklyWinner,
      biggestMover: team.rankMovement > result.biggestMover.rankMovement
        ? team
        : result.biggestMover,
      highScore: team.fantasyPoints > result.highScore.fantasyPoints
        ? team
        : result.highScore,
    }),
    {
      weeklyWinner: snapshot.teams[0],
      biggestMover: snapshot.teams[0],
      highScore: snapshot.teams[0],
    },
  ), [snapshot])
  const weeklyWinner = highlights?.weeklyWinner
  const biggestMover = highlights?.biggestMover
  const highScore = highlights?.highScore

  const handleShareAction = () => {
    if (recapFailed) {
      setShareError(null)
      setShareRetry((value) => value + 1)
      return
    }
    void shareRecap()
  }

  const chooseWeek = (week: number) => {
    setSelectedWeek(week)
    setExpandedTeam(null)
    void loadSnapshot(selectedSeason, week)
  }

  const previousWeek = snapshot?.availableWeeks.findLast((week) => week < (selectedWeek ?? 0))
  const nextWeek = snapshot?.availableWeeks.find((week) => week > (selectedWeek ?? 0))

  const shareRecap = async () => {
    if (!snapshot || !shareBlob) return
    const file = new File(
      [shareBlob],
      `freedom-league-${snapshot.season}-week-${snapshot.selectedWeek}.png`,
      { type: "image/png" },
    )
    const text = `National Freedom League standings through Week ${snapshot.selectedWeek}\n${window.location.href}`

    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Freedom League Recap", text })
        return
      }
      downloadBlob(file, file.name)
      setNotice("Recap image saved")
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return
      setNotice("Sharing failed. Try Save Image instead.")
    }
  }

  const saveRecap = () => {
    if (!snapshot || !shareBlob) return
    downloadBlob(
      shareBlob,
      `freedom-league-${snapshot.season}-week-${snapshot.selectedWeek}.png`,
    )
    setNotice("Recap image saved")
  }

  const copyRecap = async () => {
    if (!snapshot) return
    const lines = snapshot.teams.map(
      (team) => `${team.rank}. ${team.name} — ${team.totalFreedomPoints} FP (+${team.weeklyFreedomPoints})`,
    )
    try {
      await navigator.clipboard.writeText(
        `NATIONAL FREEDOM LEAGUE\n${snapshot.season} · Through Week ${snapshot.selectedWeek}\n\n${lines.join("\n")}\n\n${window.location.href}`,
      )
      setNotice("Standings copied")
    } catch {
      setNotice("Clipboard access was blocked")
    }
  }

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 2500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  return (
    <main className="dashboard-shell">
      <div className="stadium-glow" aria-hidden="true" />
      <div className="field-lines" aria-hidden="true" />

      {notice ? <div className="toast" role="status">{notice}</div> : null}

      <header className="league-header">
        <div className="brand-lockup">
          <div className="league-mark" aria-hidden="true">
            <span>FL</span>
            <i />
          </div>
          <div>
            <p className="eyebrow">Est. 2015 · The Original</p>
            <h1>National Freedom League</h1>
          </div>
        </div>

        <div className="header-actions">
          <label className="select-shell">
            <span className="sr-only">Season</span>
            <CalendarDays aria-hidden="true" className="size-4" />
            <select
              value={selectedSeason}
              onChange={(event) => {
                const season = Number(event.target.value)
                setSelectedSeason(season)
                setSelectedWeek(undefined)
                void loadSnapshot(season)
              }}
              disabled={loading}
            >
              {seasons.map((season) => <option key={season}>{season}</option>)}
            </select>
            <ChevronDown aria-hidden="true" className="size-4" />
          </label>
          <Button
            onClick={handleShareAction}
            disabled={(!shareBlob && !recapFailed) || shareLoading}
            className="share-button"
          >
            {shareLoading ? <RefreshCw className="size-4 animate-spin" /> : <Share2 className="size-4" />}
            <span>{recapFailed ? "Retry recap" : "Share recap"}</span>
          </Button>
        </div>
      </header>

      <div className="dashboard-content">
        {error && !snapshot ? (
          <section className="error-state">
            <ShieldCheck aria-hidden="true" />
            <p className="eyebrow">Signal interrupted</p>
            <h2>We couldn&apos;t reach league headquarters.</h2>
            <p>{error}</p>
            <Button onClick={() => void loadSnapshot(selectedSeason)}>
              <RefreshCw className="size-4" /> Try again
            </Button>
          </section>
        ) : loading && !snapshot ? (
          <section className="loading-state" aria-label="Loading league standings">
            <div className="broadcast-loader"><span /><span /><span /></div>
            <p>Opening the stadium</p>
          </section>
        ) : snapshot ? (
          <>
            <section className="broadcast-hero">
              <div className="week-rail">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous completed week"
                  disabled={!previousWeek || loading}
                  onClick={() => previousWeek && chooseWeek(previousWeek)}
                >
                  <ChevronLeft />
                </Button>
                <div>
                  <span>Freedom rankings</span>
                  <strong>Week {snapshot.selectedWeek}</strong>
                  <small>{snapshot.season} regular season</small>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next completed week"
                  disabled={!nextWeek || loading}
                  onClick={() => nextWeek && chooseWeek(nextWeek)}
                >
                  <ChevronRight />
                </Button>
              </div>

              <div className="hero-leader">
                <div className="rank-watermark" aria-hidden="true">01</div>
                <div className="leader-copy">
                  <p className="eyebrow gold"><Trophy aria-hidden="true" /> Freedom leader</p>
                  <h2>{snapshot.teams[0]?.name}</h2>
                  <p>
                    Commanding the table with{" "}
                    <strong>{snapshot.teams[0]?.totalFreedomPoints} Freedom Points</strong>
                  </p>
                  <div className="leader-meta">
                    <span>{snapshot.teams[0] ? formatRecord(snapshot.teams[0]) : "0-0"} record</span>
                    <span>+{snapshot.teams[0]?.weeklyFreedomPoints} this week</span>
                    <Movement value={snapshot.teams[0]?.rankMovement ?? 0} />
                  </div>
                </div>
                {snapshot.teams[0] ? (
                  <div className="leader-mark">
                    <TeamMark team={snapshot.teams[0]} size="large" />
                  </div>
                ) : null}
              </div>
            </section>

            <section className="signal-strip" aria-label="Week highlights">
              <article>
                <span className="signal-icon"><Medal aria-hidden="true" /></span>
                <div><small>Week&apos;s patriot</small><strong>{weeklyWinner?.name}</strong></div>
                <b>+{weeklyWinner?.weeklyFreedomPoints} FP</b>
              </article>
              <article>
                <span className="signal-icon"><Zap aria-hidden="true" /></span>
                <div><small>Biggest charge</small><strong>{biggestMover?.name}</strong></div>
                <b>{(biggestMover?.rankMovement ?? 0) > 0 ? `▲ ${biggestMover?.rankMovement}` : "Holding"}</b>
              </article>
              <article>
                <span className="signal-icon"><Gauge aria-hidden="true" /></span>
                <div><small>High score</small><strong>{highScore?.name}</strong></div>
                <b>{highScore?.fantasyPoints.toFixed(2)}</b>
              </article>
            </section>

            {!snapshot.isScoringResolved ? (
              <div className="integrity-alert" role="status">
                <ShieldCheck aria-hidden="true" />
                A tied score is awaiting verified bench data. Rankings may change.
              </div>
            ) : null}

            <nav className="view-tabs" aria-label="Dashboard views">
              {([
                ["standings", "Standings"],
                ["weekly", `Week ${snapshot.selectedWeek}`],
                ["records", "Records"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-current={view === value ? "page" : undefined}
                  onClick={() => setView(value)}
                >
                  {label}
                </button>
              ))}
            </nav>

            {view !== "records" ? (
              <section className="standings-panel">
                <div className="standings-heading">
                  <div>
                    <p className="eyebrow">{view === "weekly" ? "Single-week dispatch" : "The power index"}</p>
                    <h2>{view === "weekly" ? `Week ${snapshot.selectedWeek} results` : "Freedom standings"}</h2>
                  </div>
                  <div className="standings-legend">
                    <span>MOVE</span><span>WEEK</span><span>TOTAL</span>
                  </div>
                </div>

                <div className="team-list">
                  {displayTeams.map((team, index) => {
                    const expanded = expandedTeam === team.teamId
                    const shownRank = view === "weekly" ? index + 1 : team.rank
                    return (
                      <article
                        key={team.teamId}
                        className={`team-row ${shownRank <= 3 ? `podium podium-${shownRank}` : ""} ${expanded ? "expanded" : ""}`}
                        style={{ "--row-delay": `${index * 35}ms` } as React.CSSProperties}
                      >
                        <button
                          type="button"
                          className="team-row-main"
                          aria-expanded={expanded}
                          onClick={() => setExpandedTeam(expanded ? null : team.teamId)}
                        >
                          <span className="rank-cell">{String(shownRank).padStart(2, "0")}</span>
                          <span className="team-identity">
                            <TeamMark team={team} />
                            <span><strong>{team.name}</strong><small>{formatRecord(team)} · {team.fantasyPoints.toFixed(2)} pts</small></span>
                          </span>
                          <Movement value={team.rankMovement} compact />
                          <span className="week-cell">+{team.weeklyFreedomPoints}</span>
                          <span className="total-cell">{team.totalFreedomPoints}</span>
                          <ChevronDown aria-hidden="true" className="row-chevron" />
                        </button>
                        {expanded ? (
                          <div className="team-detail">
                            <div><span>Recent output</span><ScoreSparkline team={team} /></div>
                            <div><span>Week score</span><strong>{team.fantasyPoints.toFixed(2)}</strong></div>
                            <div><span>Bench tiebreak</span><strong>{team.benchPoints?.toFixed(2) ?? "Not used"}</strong></div>
                            <div><span>Previous rank</span><strong>#{team.previousRank}</strong></div>
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              </section>
            ) : (
              <section className="records-grid">
                <div className="records-intro">
                  <p className="eyebrow">Current-season intelligence</p>
                  <h2>Records room</h2>
                  <p>Live marks through Week {snapshot.selectedWeek}. The archive expands as verified ESPN history becomes available.</p>
                </div>
                <article className="record-card record-primary">
                  <Award aria-hidden="true" />
                  <small>Week {snapshot.selectedWeek} high score</small>
                  <strong>{highScore?.fantasyPoints.toFixed(2)}</strong>
                  <span>{highScore?.name}</span>
                </article>
                <article className="record-card">
                  <Sparkles aria-hidden="true" />
                  <small>Most Freedom Points</small>
                  <strong>{snapshot.teams[0]?.totalFreedomPoints}</strong>
                  <span>{snapshot.teams[0]?.name}</span>
                </article>
                <article className="record-card">
                  <Trophy aria-hidden="true" />
                  <small>Best record</small>
                  <strong>{formatRecord(snapshot.teams.toSorted((a, b) => b.record.wins - a.record.wins)[0])}</strong>
                  <span>{snapshot.teams.toSorted((a, b) => b.record.wins - a.record.wins)[0]?.name}</span>
                </article>
              </section>
            )}

            <section className="share-dock">
              <div>
                <p className="eyebrow">Tuesday transmission</p>
                <h2>Send the power rankings.</h2>
                <p>Built for Messages. Current totals, weekly gains, and rank movement in one clean image.</p>
              </div>
              <div className="share-dock-actions">
                <Button onClick={handleShareAction} disabled={(!shareBlob && !recapFailed) || shareLoading} className="share-button">
                  {recapFailed ? <RefreshCw className="size-4" /> : <Share2 className="size-4" />}
                  {recapFailed ? "Retry recap" : "Share image"}
                </Button>
                <Button variant="outline" onClick={saveRecap} disabled={!shareBlob}>
                  <Download className="size-4" /> Save
                </Button>
                <Button variant="ghost" onClick={() => void copyRecap()}>
                  <Copy className="size-4" /> Copy text
                </Button>
              </div>
            </section>

            <footer className="league-footer">
              <span>National Freedom League</span>
              <span>Updated {new Date(snapshot.updatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
              <span className="live-dot">Verified through Week {snapshot.latestCompletedWeek}</span>
            </footer>
          </>
        ) : null}
      </div>

      {loading && snapshot ? <div className="refresh-line" aria-label="Updating standings" /> : null}
      {error && snapshot ? (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss error"><X /></button>
        </div>
      ) : null}
    </main>
  )
}
