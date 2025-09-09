"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUpDown,
  Trophy,
  TrendingUp,
  Share2,
  Copy,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  WifiOff,
  RefreshCw,
  CheckCircle,
} from "lucide-react"

const teamsData = [
  {
    id: 1,
    name: "Thunder Bolts",
    totalFPs: 89,
    weekFPs: 8,
    logo: "/lightning-bolt-logo.png",
    record: "7-2",
    trend: "up",
    lastFourWeeks: [7, 8, 9, 8],
  },
  {
    id: 2,
    name: "Fire Dragons",
    totalFPs: 84,
    weekFPs: 7,
    logo: "/placeholder-fqsfz.png",
    record: "6-3",
    trend: "down",
    lastFourWeeks: [9, 7, 6, 7],
  },
  {
    id: 3,
    name: "Steel Titans",
    totalFPs: 78,
    weekFPs: 9,
    logo: "/placeholder-t6pcg.png",
    record: "6-3",
    trend: "up",
    lastFourWeeks: [6, 7, 8, 9],
  },
  {
    id: 4,
    name: "Storm Eagles",
    totalFPs: 73,
    weekFPs: 6,
    logo: "/placeholder-6f1o2.png",
    record: "5-4",
    trend: "down",
    lastFourWeeks: [8, 6, 7, 6],
  },
  {
    id: 5,
    name: "Ice Wolves",
    totalFPs: 68,
    weekFPs: 5,
    logo: "/placeholder-y15id.png",
    record: "4-5",
    trend: "down",
    lastFourWeeks: [7, 5, 4, 5],
  },
  {
    id: 6,
    name: "Golden Lions",
    totalFPs: 62,
    weekFPs: 4,
    logo: "/placeholder-8ziwv.png",
    record: "4-5",
    trend: "down",
    lastFourWeeks: [6, 4, 3, 4],
  },
  {
    id: 7,
    name: "Shadow Hawks",
    totalFPs: 58,
    weekFPs: 3,
    logo: "/placeholder-dfy32.png",
    record: "3-6",
    trend: "down",
    lastFourWeeks: [5, 3, 2, 3],
  },
  {
    id: 8,
    name: "Crimson Bears",
    totalFPs: 53,
    weekFPs: 2,
    logo: "/placeholder-vfo8r.png",
    record: "3-6",
    trend: "down",
    lastFourWeeks: [4, 2, 1, 2],
  },
  {
    id: 9,
    name: "Silver Sharks",
    totalFPs: 49,
    weekFPs: 1,
    logo: "/placeholder-5rynh.png",
    record: "2-7",
    trend: "down",
    lastFourWeeks: [3, 1, 0, 1],
  },
  {
    id: 10,
    name: "Midnight Owls",
    totalFPs: 45,
    weekFPs: 10,
    logo: "/placeholder-x5f34.png",
    record: "2-7",
    trend: "up",
    lastFourWeeks: [2, 4, 6, 10],
  },
]

export default function FantasyFootballDashboard() {
  const [selectedSeason, setSelectedSeason] = useState("2025")
  const [selectedWeek, setSelectedWeek] = useState("1")
  const [viewMode, setViewMode] = useState<"total" | "weekly">("total")
  const [sortBy, setSortBy] = useState<"totalFPs" | "weekFPs">("totalFPs")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const sharePreviewRef = useRef<HTMLDivElement>(null)

  const effectiveSortBy = viewMode === "weekly" ? "weekFPs" : "totalFPs"

  const sortedTeams = [...teamsData].sort((a, b) => {
    const aValue = sortBy === "totalFPs" ? a.totalFPs : a.weekFPs
    const bValue = sortBy === "totalFPs" ? b.totalFPs : b.weekFPs
    return sortOrder === "desc" ? bValue - aValue : aValue - bValue
  })

  const handleSort = (column: "totalFPs" | "weekFPs") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const handlePreviousWeek = () => {
    const currentWeek = Number.parseInt(selectedWeek)
    if (currentWeek > 1) {
      setSelectedWeek(String(currentWeek - 1))
    }
  }

  const handleNextWeek = () => {
    const currentWeek = Number.parseInt(selectedWeek)
    if (currentWeek < 14) {
      setSelectedWeek(String(currentWeek + 1))
    }
  }

  const getWeekFPsColor = (weekFPs: number) => {
    if (weekFPs >= 8) return "text-blue-700 bg-blue-50"
    if (weekFPs >= 5) return "text-yellow-700 bg-yellow-50"
    return "text-red-700 bg-red-50"
  }

  const Sparkline = ({ data }: { data: number[] }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    return (
      <div className="flex items-end gap-0.5 h-6 w-12">
        {data.map((value, index) => (
          <div
            key={index}
            className="bg-primary/60 w-2 rounded-sm"
            style={{
              height: `${((value - min) / range) * 100}%`,
              minHeight: "2px",
            }}
          />
        ))}
      </div>
    )
  }

  const leagueAverage = Math.round(teamsData.reduce((sum, team) => sum + team.weekFPs, 0) / teamsData.length)

  const biggestMover = teamsData.find((team) => team.trend === "up" && team.weekFPs >= 8) || teamsData[0]

  const getPatrioticGradientColor = (totalFPs: number, teams: typeof teamsData) => {
    const sortedByTotal = [...teams].sort((a, b) => b.totalFPs - a.totalFPs)
    const rank = sortedByTotal.findIndex((team) => team.totalFPs === totalFPs)
    const percentage = rank / (teams.length - 1)

    if (percentage <= 0.33) {
      // Top third: Dark green
      const intensity = 1 - (percentage / 0.33) * 0.3
      return `rgb(${Math.round(34 * intensity)}, ${Math.round(139 * intensity)}, ${Math.round(34 * intensity)})`
    } else if (percentage <= 0.66) {
      // Middle third: Green to orange-red
      const localPercentage = (percentage - 0.33) / 0.33
      const red = Math.round(34 + (184 - 34) * localPercentage)
      const green = Math.round(139 + (134 - 139) * localPercentage)
      const blue = Math.round(34 + (11 - 34) * localPercentage)
      return `rgb(${red}, ${green}, ${blue})`
    } else {
      // Bottom third: Orange-red to dark red
      const localPercentage = (percentage - 0.66) / 0.34
      const red = Math.round(184 + (139 - 184) * localPercentage)
      const green = Math.round(134 + (0 - 134) * localPercentage)
      const blue = Math.round(11 + (0 - 11) * localPercentage)
      return `rgb(${red}, ${green}, ${blue})`
    }
  }

  const copyTextVersion = async () => {
    try {
      setIsLoading(true)
      const sortedByTotal = [...teamsData].sort((a, b) => b.totalFPs - a.totalFPs)
      let text = `🇺🇸 The National Freedom League - Championship Season 2025\n`
      text += `Week ${selectedWeek} of the Freedom Campaign | Freedom Points\n\n`
      text += `Team Name | Total FPs | Week FPs\n`
      text += `${"-".repeat(40)}\n`

      sortedByTotal.forEach((team, index) => {
        const star = index === 0 ? "CHAMPION " : ""
        text += `${star}${(index + 1).toString().padStart(2)}. ${team.name.padEnd(15)} | ${team.totalFPs.toString().padStart(3)} | ${team.weekFPs.toString().padStart(2)}\n`
      })

      text += `\n🇺🇸 Est. 2023 | Share the Freedom! 🇺🇸`

      await navigator.clipboard.writeText(text)
      setCopySuccess("Freedom shared successfully!")
      setTimeout(() => setCopySuccess(null), 3000)
    } catch (error) {
      setError("Failed to share the freedom. Please try again.")
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const copyImageVersion = async () => {
    if (!sharePreviewRef.current) return

    try {
      setIsLoading(true)
      
      // Check clipboard permissions first
      if (!navigator.clipboard || !navigator.clipboard.write) {
        throw new Error("Clipboard API not supported")
      }

      const html2canvas = (await import("html2canvas")).default
      
      // Create a completely new element with inline styles instead of cloning
      const createStyledElement = () => {
        const container = document.createElement('div')
        container.style.cssText = `
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          color: white;
          padding: 32px;
          border-radius: 8px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 4px solid #dc2626;
          width: 700px;
          min-height: fit-content;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          position: absolute;
          left: -9999px;
          top: -9999px;
        `

        // Header
        const header = document.createElement('div')
        header.style.cssText = `
          text-align: center;
          margin-bottom: 32px;
          border-bottom: 2px solid #dc2626;
          padding-bottom: 24px;
        `
        
        const title = document.createElement('h2')
        title.style.cssText = 'font-size: 24px; font-weight: bold; margin: 12px 0; color: white;'
        title.textContent = '🇺🇸 The National Freedom League'
        
        const subtitle = document.createElement('p')
        subtitle.style.cssText = 'color: #bfdbfe; font-size: 18px; margin: 8px 0;'
        subtitle.textContent = `Championship Season 2025 - Week ${selectedWeek}`
        
        const standings = document.createElement('p')
        standings.style.cssText = 'color: #fde047; font-weight: bold; margin: 4px 0;'
        standings.textContent = 'Freedom Points Standings'
        
        const est = document.createElement('p')
        est.style.cssText = 'color: #93c5fd; font-size: 14px; margin: 4px 0;'
        est.textContent = 'Est. 2023'
        
        header.appendChild(title)
        header.appendChild(subtitle)
        header.appendChild(standings)
        header.appendChild(est)

        // Table header
        const tableHeader = document.createElement('div')
        tableHeader.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          margin-bottom: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        `
        
        const headerLeft = document.createElement('div')
        headerLeft.style.cssText = 'display: flex; align-items: center; gap: 16px;'
        headerLeft.innerHTML = '<span style="color: #fde047; font-weight: bold; font-size: 18px; width: 48px;">Rank</span><span style="color: #fde047; font-weight: bold; font-size: 18px;">Team Name</span>'
        
        const headerRight = document.createElement('div')
        headerRight.style.cssText = 'display: flex; gap: 32px; color: #fde047; font-weight: bold; font-size: 18px;'
        headerRight.innerHTML = '<span style="width: 80px; text-align: center;">Total FPs</span><span style="width: 80px; text-align: center;">Week FPs</span>'
        
        tableHeader.appendChild(headerLeft)
        tableHeader.appendChild(headerRight)

        // Team rows
        const teamsContainer = document.createElement('div')
        teamsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px;'
        
        const sortedByTotal = [...teamsData].sort((a, b) => b.totalFPs - a.totalFPs)
        
        sortedByTotal.forEach((team, index) => {
          const row = document.createElement('div')
          const bgColor = getPatrioticGradientColor(team.totalFPs, teamsData)
          row.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background-color: ${bgColor};
          `
          
          const rowLeft = document.createElement('div')
          rowLeft.style.cssText = 'display: flex; align-items: center; gap: 16px;'
          rowLeft.innerHTML = `<span style="color: white; font-weight: bold; font-size: 18px; width: 48px;">${index + 1}.</span><span style="color: white; font-weight: bold; font-size: 18px;">${team.name}</span>`
          
          const rowRight = document.createElement('div')
          rowRight.style.cssText = 'display: flex; gap: 32px; color: white; font-weight: bold; font-size: 18px;'
          rowRight.innerHTML = `<span style="width: 80px; text-align: center;">${team.totalFPs}</span><span style="width: 80px; text-align: center;">${team.weekFPs}</span>`
          
          row.appendChild(rowLeft)
          row.appendChild(rowRight)
          teamsContainer.appendChild(row)
        })

        // Footer
        const footer = document.createElement('div')
        footer.style.cssText = `
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #dc2626;
        `
        footer.innerHTML = '<p style="color: #bfdbfe; font-size: 14px; margin: 0;">🇺🇸 Share the Freedom! 🇺🇸</p>'

        container.appendChild(header)
        container.appendChild(tableHeader)
        container.appendChild(teamsContainer)
        container.appendChild(footer)
        
        return container
      }

      const tempElement = createStyledElement()
      document.body.appendChild(tempElement)

      // Wait for element to be rendered and get its actual dimensions
      await new Promise(resolve => setTimeout(resolve, 100))
      const elementRect = tempElement.getBoundingClientRect()
      const actualHeight = Math.max(elementRect.height, tempElement.scrollHeight)

      const canvas = await html2canvas(tempElement, {
        backgroundColor: "#1e3a8a",
        scale: 2,
        width: 700,
        height: actualHeight,
        useCORS: true,
        allowTaint: true,
      })

      // Clean up temp element
      document.body.removeChild(tempElement)

      // Convert canvas to blob and copy to clipboard
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const item = new ClipboardItem({ "image/png": blob })
              await navigator.clipboard.write([item])
              setCopySuccess("Freedom shared successfully!")
              setTimeout(() => setCopySuccess(null), 3000)
              resolve()
            } catch (clipboardError) {
              console.error("Clipboard error:", clipboardError)
              reject(clipboardError)
            }
          } else {
            reject(new Error("Failed to create image blob"))
          }
        }, "image/png")
      })
    } catch (error) {
      console.error("Copy image error:", error)
      setError(`Failed to share the freedom: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const retryOperation = () => {
    setError(null)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const LoadingSkeleton = () => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const EmptyState = () => (
    <Card>
      <CardContent className="p-12 text-center">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No standings data available</h3>
        <p className="text-muted-foreground mb-4">
          Standings will appear here once the season begins and teams start playing.
        </p>
        <Button onClick={retryOperation} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {!isOnline && (
        <div className="bg-red-600 text-white p-2 text-center text-sm">
          <WifiOff className="h-4 w-4 inline mr-2" />
          You&apos;re currently offline. Some features may not work properly.
        </div>
      )}

      {copySuccess && (
        <div className="fixed top-4 right-4 z-50 bg-blue-700 text-white p-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4" />
          {copySuccess}
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <Button onClick={retryOperation} variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
          {error}
        </div>
      )}

      <div className="p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <span>Championship Season {selectedSeason}</span>
                <span className="text-red-500">•</span>
                <span>Week {selectedWeek} of the Freedom Campaign</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center shadow-md border-2 border-blue-900">
                  <span className="text-white font-bold text-sm">NFL</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-900 text-balance flex items-center gap-2">
                    🇺🇸 The National Freedom League
                  </h1>
                  <p className="text-blue-700 font-semibold">Freedom Points Standings</p>
                  <p className="text-xs text-blue-600">Est. 2023</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger
                  className="w-full sm:w-32 min-h-[48px] focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 border-blue-200"
                  aria-label="Select season"
                >
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousWeek}
                  disabled={selectedWeek === "1"}
                  className="min-h-[48px] min-w-[48px] transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 border-blue-200 hover:bg-blue-50 bg-transparent"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger
                    className="w-full sm:w-32 min-h-[48px] focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 border-blue-200"
                    aria-label="Select week"
                  >
                    <SelectValue placeholder="Week" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        Week {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextWeek}
                  disabled={selectedWeek === "14"}
                  className="min-h-[48px] min-w-[48px] transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 border-blue-200 hover:bg-blue-50 bg-transparent"
                  aria-label="Next week"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex rounded-lg bg-blue-100 p-1 border border-blue-200">
                <Button
                  variant={viewMode === "total" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setViewMode("total")
                    setSortBy("totalFPs")
                  }}
                  className={`text-sm transition-all duration-200 min-h-[40px] focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    viewMode === "total" ? "bg-blue-700 text-white hover:bg-blue-800" : "text-blue-700 hover:bg-blue-50"
                  }`}
                  aria-pressed={viewMode === "total"}
                >
                  Total Standings
                </Button>
                <Button
                  variant={viewMode === "weekly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setViewMode("weekly")
                    setSortBy("weekFPs")
                  }}
                  className={`text-sm transition-all duration-200 min-h-[40px] focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    viewMode === "weekly"
                      ? "bg-blue-700 text-white hover:bg-blue-800"
                      : "text-blue-700 hover:bg-blue-50"
                  }`}
                  aria-pressed={viewMode === "weekly"}
                >
                  Weekly View
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-700 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Freedom Leader</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-blue-900 text-balance">{sortedTeams[0]?.name}</div>
                <p className="text-xs text-blue-600">{sortedTeams[0]?.totalFPs} Total FPs</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-600 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Week {selectedWeek} Champion</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-blue-900 text-balance">
                  {[...teamsData].sort((a, b) => b.weekFPs - a.weekFPs)[0]?.name}
                </div>
                <p className="text-xs text-blue-600">
                  {[...teamsData].sort((a, b) => b.weekFPs - a.weekFPs)[0]?.weekFPs} Week FPs
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md border-l-4 border-l-red-600 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">League Average</CardTitle>
                <ArrowUpDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-red-700">{leagueAverage}</div>
                <p className="text-xs text-blue-600">Week {selectedWeek} Average</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md border-l-4 border-l-yellow-500 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Rising Patriot</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-yellow-700 text-balance">{biggestMover?.name}</div>
                <p className="text-xs text-blue-600">+{biggestMover?.weekFPs} Week FPs</p>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : error && !teamsData.length ? (
            <EmptyState />
          ) : (
            <>
              <Card className="hidden md:block shadow-sm bg-white/90 backdrop-blur-sm border border-blue-200">
                <CardHeader className="bg-blue-800 text-white rounded-t-lg shadow-sm">
                  <CardTitle className="text-xl flex items-center gap-2 font-bold text-white">
                    {viewMode === "total" ? "Season Standings" : `Week ${selectedWeek} Results`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full" role="table" aria-label="Fantasy football standings">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left py-3 px-2 font-medium text-blue-700" scope="col">
                            Rank
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-blue-700" scope="col">
                            Team
                          </th>
                          <th className="text-center py-3 px-2 font-medium text-blue-700" scope="col">
                            Trend
                          </th>
                          <th
                            className={`text-right py-3 px-2 font-medium cursor-pointer hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded ${
                              sortBy === "totalFPs" ? "bg-blue-50 text-blue-900" : "text-blue-700"
                            }`}
                            onClick={() => handleSort("totalFPs")}
                            onKeyDown={(e) => e.key === "Enter" && handleSort("totalFPs")}
                            tabIndex={0}
                            role="button"
                            aria-label="Sort by total fantasy points"
                            scope="col"
                          >
                            <div className="flex items-center justify-end gap-1">
                              Total FPs
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </th>
                          <th
                            className={`text-right py-3 px-2 font-medium cursor-pointer hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded ${
                              sortBy === "weekFPs" ? "bg-blue-50 text-blue-900" : "text-blue-700"
                            }`}
                            onClick={() => handleSort("weekFPs")}
                            onKeyDown={(e) => e.key === "Enter" && handleSort("weekFPs")}
                            tabIndex={0}
                            role="button"
                            aria-label="Sort by weekly fantasy points"
                            scope="col"
                          >
                            <div className="flex items-center justify-end gap-1">
                              Week FPs
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedTeams.map((team, index) => (
                          <tr
                            key={team.id}
                            className="border-b border-blue-100 hover:bg-blue-50/50 transition-all duration-200 focus-within:bg-blue-50/50"
                            tabIndex={0}
                            role="row"
                          >
                            <td className="py-4 px-2" role="cell">
                              <div className="flex items-center">
                                {index === 0 && (
                                  <Badge className="mr-2 bg-yellow-600 text-white hover:bg-yellow-700">1st</Badge>
                                )}
                                {index === 1 && (
                                  <Badge variant="secondary" className="mr-2 bg-blue-100 text-blue-800">
                                    2nd
                                  </Badge>
                                )}
                                {index === 2 && (
                                  <Badge variant="outline" className="mr-2 border-red-300 text-red-700">
                                    3rd
                                  </Badge>
                                )}
                                {index > 2 && <span className="text-blue-600 font-medium w-8">{index + 1}</span>}
                              </div>
                            </td>
                            <td className="py-4 px-2" role="cell">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-blue-200">
                                  <AvatarImage src={team.logo || "/placeholder.svg"} alt={`${team.name} logo`} />
                                  <AvatarFallback className="bg-blue-100 text-blue-800">
                                    {team.name
                                      .split(" ")
                                      .map((word) => word[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-blue-900">{team.name}</span>
                                    {team.trend === "up" ? (
                                      <TrendingUp className="h-3 w-3 text-blue-600" aria-label="Trending up" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 text-red-600" aria-label="Trending down" />
                                    )}
                                  </div>
                                  <span className="text-xs text-blue-600">{team.record}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center" role="cell">
                              <Sparkline data={team.lastFourWeeks} />
                            </td>
                            <td
                              className={`py-4 px-2 text-right transition-colors ${
                                sortBy === "totalFPs" ? "bg-blue-50/50" : ""
                              }`}
                              role="cell"
                            >
                              <span className="font-semibold text-lg text-blue-900">{team.totalFPs}</span>
                            </td>
                            <td
                              className={`py-4 px-2 text-right transition-colors ${
                                sortBy === "weekFPs" ? "bg-blue-50/50" : ""
                              }`}
                              role="cell"
                            >
                              <Badge variant="secondary" className={`font-medium ${getWeekFPsColor(team.weekFPs)}`}>
                                {team.weekFPs}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="md:hidden space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-1">
                    {viewMode === "total" ? "Season Standings" : `Week ${selectedWeek} Results`}
                  </h2>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSort("totalFPs")}
                      className={`text-xs border-blue-200 ${sortBy === "totalFPs" ? "bg-blue-100 text-blue-800" : "text-blue-700"}`}
                    >
                      Total FPs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSort("weekFPs")}
                      className={`text-xs border-blue-200 ${sortBy === "weekFPs" ? "bg-blue-100 text-blue-800" : "text-blue-700"}`}
                    >
                      Week FPs
                    </Button>
                  </div>
                </div>

                {sortedTeams.map((team, index) => (
                  <Card
                    key={team.id}
                    className="transition-all duration-200 hover:shadow-md bg-white/90 backdrop-blur-sm border border-blue-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            {index === 0 && <Badge className="mb-1 text-xs bg-yellow-600 text-white">1st</Badge>}
                            {index === 1 && (
                              <Badge variant="secondary" className="mb-1 text-xs bg-blue-100 text-blue-800">
                                2nd
                              </Badge>
                            )}
                            {index === 2 && (
                              <Badge variant="outline" className="mb-1 text-xs border-red-300 text-red-700">
                                3rd
                              </Badge>
                            )}
                            {index > 2 && <span className="text-sm font-medium text-blue-600 mb-1">{index + 1}</span>}
                            <Avatar className="h-12 w-12 border-2 border-blue-200">
                              <AvatarImage src={team.logo || "/placeholder.svg"} alt={`${team.name} logo`} />
                              <AvatarFallback className="bg-blue-100 text-blue-800">
                                {team.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base text-balance text-blue-900">{team.name}</h3>
                              {team.trend === "up" ? (
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <p className="text-sm text-blue-600">{team.record}</p>
                            <div className="mt-2">
                              <Sparkline data={team.lastFourWeeks} />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-900 mb-1">{team.totalFPs}</div>
                          <div className="text-xs text-blue-600 mb-2">Total FPs</div>
                          <Badge variant="secondary" className={`${getWeekFPsColor(team.weekFPs)}`}>
                            {team.weekFPs} Week FPs
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-center">
            <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2 min-h-[48px] transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 bg-red-600 hover:bg-red-700 text-white font-bold"
                  size="lg"
                  aria-label="Share the freedom"
                >
                  <Share2 className="h-4 w-4" />
                  🇺🇸 Share the Freedom
                </Button>
              </DialogTrigger>
              <DialogContent className="w-fit max-w-4xl h-fit max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-blue-900">🇺🇸 Share the Freedom</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6">
                  <div
                    ref={sharePreviewRef}
                    className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-8 rounded-lg shadow-2xl border-4 border-red-600"
                    style={{ width: "700px", minHeight: "fit-content" }}
                  >
                    <div className="text-center mb-8 border-b-2 border-red-600 pb-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold text-white">The National Freedom League</h2>
                        <span className="text-3xl">🇺🇸</span>
                      </div>
                      <p className="text-blue-200 text-lg mb-2">Championship Season 2025 - Week {selectedWeek}</p>
                      <p className="text-yellow-300 font-bold mb-1">Freedom Points Standings</p>
                      <p className="text-blue-300 text-sm">Est. 2023</p>
                    </div>

                    <div className="flex items-center justify-between p-4 mb-4 bg-white/10 rounded-lg border border-white/20">
                      <div className="flex items-center gap-4">
                        <span className="text-yellow-300 font-bold text-lg w-12">Rank</span>
                        <span className="text-yellow-300 font-bold text-lg">Team Name</span>
                      </div>
                      <div className="flex gap-8 text-yellow-300 font-bold text-lg">
                        <span className="w-20 text-center">Total FPs</span>
                        <span className="w-20 text-center">Week FPs</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[...teamsData]
                        .sort((a, b) => b.totalFPs - a.totalFPs)
                        .map((team, index) => (
                          <div
                            key={team.id}
                            className="flex items-center justify-between p-4 rounded-lg text-white font-medium border border-white/20"
                            style={{ backgroundColor: getPatrioticGradientColor(team.totalFPs, teamsData) }}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-white font-bold text-lg w-12">{index + 1}.</span>
                              <span className="text-white font-bold text-lg">{team.name}</span>
                            </div>
                            <div className="flex gap-8 text-white font-bold text-lg">
                              <span className="w-20 text-center">{team.totalFPs}</span>
                              <span className="w-20 text-center">{team.weekFPs}</span>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="text-center mt-8 pt-6 border-t-2 border-red-600">
                      <p className="text-blue-200 text-sm">🇺🇸 Share the Freedom! 🇺🇸</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={copyImageVersion}
                      className="flex items-center gap-2 min-h-[48px] transition-all duration-200 hover:scale-105 bg-blue-700 hover:bg-blue-800 text-white"
                      disabled={isLoading}
                      aria-label="Copy as image"
                    >
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      Copy Freedom Image
                    </Button>
                    <Button
                      onClick={copyTextVersion}
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent min-h-[48px] transition-all duration-200 hover:scale-105 border-red-600 text-red-700 hover:bg-red-50"
                      disabled={isLoading}
                      aria-label="Copy as text"
                    >
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                      Copy Freedom Text
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
