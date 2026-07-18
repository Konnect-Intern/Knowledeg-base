"use client"

import { useState, useRef } from "react"
import { Globe, Upload, Headphones, Clock, ChevronDown, ArrowLeft, FolderOpen, Check, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { KB_SOURCES } from "@/lib/kb-mock"

const HELPDESK_PLATFORMS = [
  {
    id: "zendesk",
    name: "Zendesk",
    icon: (
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#03363D" />
        <path d="M14 11.5a4 4 0 0 1-8 0h8zM10 7a4 4 0 0 0 4-4v8a4 4 0 0 0-4-4zM18 20.5a4 4 0 0 0 8 0h-8zM22 25a4 4 0 0 1-4 4v-8a4 4 0 0 1 4 4z" fill="#fff" />
      </svg>
    ),
  },
  {
    id: "intercom",
    name: "Intercom",
    icon: (
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <rect width="32" height="32" rx="8" fill="#1F8DED" />
        <path d="M16 6c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm0 16a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" fill="white" opacity=".3" />
        <path d="M11 13h10M11 16h10M11 19h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "freshdesk",
    name: "Freshdesk",
    icon: (
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <circle cx="16" cy="16" r="14" fill="#25C16F" />
        <path d="M9 16a7 7 0 0 1 14 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3" fill="white" />
      </svg>
    ),
  },
  {
    id: "hubspot",
    name: "HubSpot",
    icon: (
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <path d="M19 10.5V8.75A2.25 2.25 0 0 0 16.75 6.5h-.5A2.25 2.25 0 0 0 14 8.75v1.75M14 10.5c0 1.381 1.119 2.5 2.5 2.5S19 11.881 19 10.5" stroke="#FF7A59" strokeWidth="1.5" />
        <path d="M19 10.5l3.5 2v5l-6.5 3.5L9.5 17.5v-5l3.5-2" stroke="#FF7A59" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9.5 12.5L16 16l6.5-3.5M16 16v6" stroke="#FF7A59" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "salesforce",
    name: "Salesforce",
    icon: (
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <path d="M13.4 8.2a4.8 4.8 0 0 1 3.4-1.4 4.9 4.9 0 0 1 4.4 2.7 3.6 3.6 0 0 1 1.4-.3 3.8 3.8 0 0 1 0 7.6H11a3.8 3.8 0 0 1 0-7.6 3.9 3.9 0 0 1 2.4.8" fill="#00A1E0" />
      </svg>
    ),
  },
]

const SYNC_SCHEDULES = [
  { value: "manual", label: "Manual only" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]
const MAX_PAGES_OPTIONS = ["25", "50", "100", "200", "Custom"]

type SourceType = "WEBSITE" | "FILES" | "HELPDESK"

interface AddSourcePageProps {
  onBack: () => void
  category?: string
  onAdd: (source: {
    name: string
    url: string
    type: "WEBSITE" | "FILES" | "HELPDESK"
    category: string
    schedule: string
  }) => void
}

export function AddSourcePage({ onBack, onAdd, category }: AddSourcePageProps) {
  const [activeTab, setActiveTab] = useState<SourceType>("WEBSITE")

  // Source states
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [scrapeMode, setScrapeMode] = useState<"simple" | "full">("simple")
  const [maxPages, setMaxPages] = useState("50")
  const [maxDepth, setMaxDepth] = useState("5")
  const [syncSchedule, setSyncSchedule] = useState("manual")
  const [syncOpen, setSyncOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🌟 Scheduling States
  const [syncTime, setSyncTime] = useState("00:00") // Native time input format (HH:mm)
  const [syncDay, setSyncDay] = useState("Monday")
  const [syncDate, setSyncDate] = useState("1")

  // Category States (Now integrated into the form)
  // Change to a managed state so it can update
  const [categoryList, setCategoryList] = useState(() =>
    Array.from(new Set(KB_SOURCES.map((s) => s.category))).sort()
  );
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  // Validation
  const canSubmitSource =
    (activeTab === "WEBSITE" && websiteUrl.trim().length > 0) ||
    activeTab === "FILES" ||
    (activeTab === "HELPDESK" && selectedPlatform !== "")

  const isCategoryValid = category
    ? true
    : (isCreatingNew ? newCategoryName.trim().length > 0 : selectedCategory !== "")

  const isFormValid = canSubmitSource && isCategoryValid

  function handleSubmit() {
    if (!isFormValid) return

    const finalCategory = isCreatingNew ? newCategoryName.trim() : selectedCategory

    if (isCreatingNew && finalCategory && !categoryList.includes(finalCategory)) {
      setCategoryList((prev) => [...prev, finalCategory].sort());
    }

    // Determine the exact string to save for the schedule configuration
    let scheduleConfig = syncSchedule;
    if (syncSchedule === "daily") scheduleConfig = `daily_at_${syncTime}`;
    if (syncSchedule === "weekly") scheduleConfig = `weekly_on_${syncDay}_at_${syncTime}`;
    if (syncSchedule === "monthly") scheduleConfig = `monthly_on_${syncDate}_at_${syncTime}`;

    let sourceName = "Source";
    if (activeTab === "WEBSITE") {
      sourceName = websiteUrl;
    } else if (activeTab === "HELPDESK") {
      sourceName = HELPDESK_PLATFORMS.find((p) => p.id === selectedPlatform)?.name || "Helpdesk";
    } else if (activeTab === "FILES") {
      sourceName = "Uploaded Files";
    }

    onAdd({
      name: sourceName,
      url: websiteUrl,
      type: activeTab,
      category: finalCategory,
      schedule: scheduleConfig // 🌟 Send the structured schedule string to your backend
    })
  }

  const submitLabel = activeTab === "WEBSITE" ? "Add website" : activeTab === "FILES" ? "Add files" : "Add helpdesk"

  return (
    <div className="h-full w-full pb-6 flex flex-col">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors flex items-center gap-1.5"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Add knowledge source</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure where your agent pulls its information from.</p>
      </div>

      {/* The Two-Column Settings Layout - Compacted */}
      <div className="border border-border rounded-xl bg-card shadow-sm flex flex-col divide-y divide-border">

        {/* ROW 1: Source Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
          <div className="md:col-span-1 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Source Type</h3>
            <p className="text-xs text-muted-foreground pr-4">Choose how you want to import your data into the knowledge base.</p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab("WEBSITE")}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all text-center",
                  activeTab === "WEBSITE"
                    ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] text-[oklch(0.45_0.15_131.684)] shadow-sm ring-1 ring-[oklch(0.648_0.2_131.684)]"
                    : "border-border text-foreground hover:border-muted-foreground bg-background"
                )}
              >
                <Globe className="size-5 shrink-0" />
                Website
              </button>
              <button
                onClick={() => setActiveTab("FILES")}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all text-center",
                  activeTab === "FILES"
                    ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] text-[oklch(0.45_0.15_131.684)] shadow-sm ring-1 ring-[oklch(0.648_0.2_131.684)]"
                    : "border-border text-foreground hover:border-muted-foreground bg-background"
                )}
              >
                <Upload className="size-5 shrink-0" />
                Files
              </button>
              <button
                onClick={() => setActiveTab("HELPDESK")}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all text-center",
                  activeTab === "HELPDESK"
                    ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] text-[oklch(0.45_0.15_131.684)] shadow-sm ring-1 ring-[oklch(0.648_0.2_131.684)]"
                    : "border-border text-foreground hover:border-muted-foreground bg-background"
                )}
              >
                <Headphones className="size-5 shrink-0" />
                Helpdesk
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 ROW 2: Category (Moved to top) */}
        {!category && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-foreground">Category</h3>
            </div>
            <div className="md:col-span-2">
              {isCreatingNew ? (
                // 🌟 Input field mode
                <div className="flex gap-2 max-w-sm">
                  <Input
                    autoFocus
                    placeholder="Enter category name..."
                    className="h-9"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button
                    className="h-9 bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white"
                    onClick={() => {
                      if (newCategoryName && !categoryList.includes(newCategoryName)) {
                        setCategoryList([...categoryList, newCategoryName].sort());
                        setSelectedCategory(newCategoryName);
                        setIsCreatingNew(false);
                        setNewCategoryName("");
                      }
                    }}
                  >
                    Add
                  </Button>
                  <Button variant="ghost" className="h-9 px-2" onClick={() => setIsCreatingNew(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                // 🌟 Dropdown mode
                <div className="relative w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    className="w-full flex items-center justify-between h-9 px-3 rounded-md border border-border bg-background text-sm shadow-sm hover:border-muted-foreground"
                  >
                    <span className="truncate">{selectedCategory || "Select or create category..."}</span>
                    <ChevronDown className="size-4 opacity-50" />
                  </button>

                  {categoryOpen && (
                    <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-md shadow-xl max-h-[200px] overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-1">
                          {categoryList.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
                              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted"
                            >
                              {cat}
                            </button>
                          ))}
                          <button
                            onClick={() => { setIsCreatingNew(true); setCategoryOpen(false); }}
                            className="w-full text-left px-2 py-1.5 text-sm text-[oklch(0.648_0.2_131.684)] font-medium hover:bg-muted"
                          >
                            <Plus className="size-3.5 inline mr-2" /> Create new
                          </button>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {/* ── WEBSITE CONFIGURATION ROWS ── */}
        {activeTab === "WEBSITE" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
              <div className="md:col-span-1 space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Website URL</h3>
                <p className="text-xs text-muted-foreground pr-4">The starting point for our crawler.</p>
              </div>
              <div className="md:col-span-2">
                <Input
                  placeholder="https://docs.example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="max-w-md h-9 border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
              <div className="md:col-span-1 space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Crawler Settings</h3>
                <p className="text-xs text-muted-foreground pr-4">Configure how we process pages and limits.</p>
              </div>

              <div className="md:col-span-2 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Scrape Mode</label>
                  <div className="flex max-w-sm rounded-md border border-border bg-muted/40 p-1">
                    <button
                      onClick={() => setScrapeMode("simple")}
                      className={cn(
                        "flex-1 px-4 py-1.5 rounded text-xs font-medium transition-all",
                        scrapeMode === "simple"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      Simple HTML
                    </button>
                    <button
                      onClick={() => setScrapeMode("full")}
                      className={cn(
                        "flex-1 px-4 py-1.5 rounded text-xs font-medium transition-all",
                        scrapeMode === "full"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      Full page (renders JS)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Max pages to index</label>
                    <div className="flex flex-wrap gap-1.5">
                      {MAX_PAGES_OPTIONS.slice(0, 3).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setMaxPages(opt)}
                          className={cn(
                            "px-3 py-1 rounded border text-xs font-medium transition-colors",
                            maxPages === opt
                              ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] text-[oklch(0.45_0.15_131.684)]"
                              : "border-border text-muted-foreground hover:border-foreground hover:bg-muted/30 bg-background"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Max depth (hops)</label>
                    <Input
                      type="number"
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(e.target.value)}
                      className="w-full h-8 border-border text-sm"
                      min={1}
                      max={20}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── FILES CONFIGURATION ROW ── */}
        {activeTab === "FILES" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
            <div className="md:col-span-1 space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Upload Files</h3>
              <p className="text-xs text-muted-foreground pr-4">Upload documents directly. We support PDFs, text files, and markdown.</p>
            </div>
            <div className="md:col-span-2">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full max-w-md border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                  dragOver
                    ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)]"
                    : "border-border bg-muted/20 hover:border-[oklch(0.648_0.2_131.684)] hover:bg-muted/40"
                )}
              >
                <input ref={fileInputRef} type="file" multiple className="hidden" accept=".pdf,.docx,.txt,.md,.html" />
                <div className="size-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                  <Upload className="size-4 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-[11px] text-muted-foreground mt-1">PDF, DOCX, TXT, MD, HTML (max 50MB each)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HELPDESK CONFIGURATION ROW ── */}
        {activeTab === "HELPDESK" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
            <div className="md:col-span-1 space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Platform</h3>
              <p className="text-xs text-muted-foreground pr-4">Select the platform where your articles and documentation are currently hosted.</p>
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {HELPDESK_PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left",
                      selectedPlatform === platform.id
                        ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] shadow-sm ring-1 ring-[oklch(0.648_0.2_131.684)]"
                        : "border-border hover:border-muted-foreground bg-background hover:bg-muted/20"
                    )}
                  >
                    {platform.icon}
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border-t-0">

          {/* Left Column: Label */}
          <div className="md:col-span-1 flex items-center">
            <h3 className="text-sm font-semibold text-foreground">Sync Schedule</h3>
          </div>

          {/* Right Column: Inputs */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 w-full">

              {/* Main Schedule Selector */}
              <select
                value={syncSchedule}
                onChange={(e) => setSyncSchedule(e.target.value)}
                className="h-9 px-3 rounded-md border border-border bg-background text-sm min-w-[130px] shrink-0 focus:outline-none focus:ring-2 focus:ring-[oklch(0.648_0.2_131.684)]"
              >
                <option value="manual">Manual sync</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              {/* Daily Inputs */}
              {syncSchedule === "daily" && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground shrink-0">at</span>
                  <Input
                    type="time"
                    value={syncTime}
                    onChange={(e) => setSyncTime(e.target.value)}
                    className="w-[120px] h-9 shrink-0"
                  />
                </div>
              )}

              {/* Weekly Inputs */}
              {syncSchedule === "weekly" && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground shrink-0">on</span>
                  <select
                    value={syncDay}
                    onChange={(e) => setSyncDay(e.target.value)}
                    className="h-9 px-3 rounded-md border border-border bg-background text-sm shrink-0"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className="text-sm text-muted-foreground shrink-0">at</span>
                  <Input type="time" value={syncTime} onChange={(e) => setSyncTime(e.target.value)} className="w-[120px] h-9 shrink-0" />
                </div>
              )}

              {/* Monthly Inputs */}
              {syncSchedule === "monthly" && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground shrink-0">on day</span>
                  <select
                    value={syncDate}
                    onChange={(e) => setSyncDate(e.target.value)}
                    className="h-9 px-3 pr-8 rounded-md border border-border bg-background text-sm shrink-0"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className="text-sm text-muted-foreground shrink-0">at</span>
                  <Input type="time" value={syncTime} onChange={(e) => setSyncTime(e.target.value)} className="w-[120px] h-9 shrink-0" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer with Submit Button */}
        <div className="p-5 border-t border-border bg-muted/10 flex justify-end rounded-b-xl">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={cn(
              "bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white px-8 h-9 shadow-sm",
              !isFormValid && "opacity-50 cursor-not-allowed"
            )}
          >
            {submitLabel}
          </Button>
        </div>

      </div>
    </div>
  )
}

function SyncScheduleSelect({
  value,
  onChange,
  open,
  setOpen,
}: {
  value: string
  onChange: (v: string) => void
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const selected = SYNC_SCHEDULES.find((s) => s.value === value)
  return (
    <div className="relative w-full max-w-[200px]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground hover:border-muted-foreground transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-muted-foreground" />
          <span>{selected?.label ?? "Manual only"}</span>
        </div>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          {SYNC_SCHEDULES.map((s) => (
            <button
              key={s.value}
              onClick={() => { onChange(s.value); setOpen(false) }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
                value === s.value && "bg-muted font-medium text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}