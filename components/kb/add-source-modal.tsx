"use client"

import { useState, useRef } from "react"
import { Globe, Upload, Headphones, X, Clock, ChevronDown, Plus, FolderOpen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { KB_SOURCES } from "@/lib/kb-mock"

type SourceType = "WEBSITE" | "FILES" | "HELPDESK"

interface AddSourceModalProps {
  isOpen: boolean
  onClose: () => void
  /** When provided the category step is skipped entirely */
  category?: string
  onAdd: (source: {
    name: string
    url: string
    type: "WEBSITE" | "FILES" | "HELPDESK"
    category: string
  }) => void
}

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

export function AddSourceModal({ isOpen, onClose, category, onAdd }: AddSourceModalProps) {
  // Step: "source" = configure source, "category" = pick/create category
  const [step, setStep] = useState<"source" | "category">("source")

  // Source config state
  const [activeTab, setActiveTab] = useState<SourceType>("WEBSITE")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [scrapeMode, setScrapeMode] = useState<"simple" | "full">("simple")
  const [maxPages, setMaxPages] = useState("50")
  const [maxDepth, setMaxDepth] = useState("5")
  const [syncSchedule, setSyncSchedule] = useState("manual")
  const [syncOpen, setSyncOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Category step state
  const existingCategories = Array.from(new Set(KB_SOURCES.map((s) => s.category))).sort()
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  function handleReset() {
    setStep("source")
    setActiveTab("WEBSITE")
    setWebsiteUrl("")
    setScrapeMode("simple")
    setMaxPages("50")
    setMaxDepth("5")
    setSyncSchedule("manual")
    setSelectedPlatform("")
    setDragOver(false)
    setSelectedCategory("")
    setIsCreatingNew(false)
    setNewCategoryName("")
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  // Called from "Add website" / "Upload files" / "Continue" button
  function handleSourceNext() {
    if (category) {
      // Category pre-determined — submit directly
      handleFinalSubmit(category)
    } else {
      // Show category picker
      setStep("category")
    }
  }

  function handleFinalSubmit(resolvedCategory: string) {
    let name = ""
    let url = ""

    if (activeTab === "WEBSITE") {
      url = websiteUrl.trim()
      try {
        name = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      } catch {
        name = url
      }
    } else if (activeTab === "FILES") {
      name = "Uploaded Files"
      url = ""
    } else if (activeTab === "HELPDESK") {
      const platform = HELPDESK_PLATFORMS.find((p) => p.id === selectedPlatform)
      name = platform?.name ?? "Helpdesk"
      url = ""
    }

    onAdd({ name, url, type: activeTab, category: resolvedCategory })
    handleClose()
  }

  function handleCategorySubmit() {
    const resolved = isCreatingNew ? newCategoryName.trim() : selectedCategory
    if (!resolved) return
    handleFinalSubmit(resolved)
  }

  const canSubmitSource =
    (activeTab === "WEBSITE" && websiteUrl.trim().length > 0) ||
    activeTab === "FILES" ||
    (activeTab === "HELPDESK" && selectedPlatform !== "")

  const canSubmitCategory = isCreatingNew
    ? newCategoryName.trim().length > 0
    : selectedCategory !== ""

  const sourceSubmitLabel =
    activeTab === "WEBSITE"
      ? category ? "Add website" : "Next"
      : activeTab === "FILES"
        ? category ? "Upload files" : "Next"
        : "Next"

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-w-[90vw] w-full p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {step === "source" ? "Add knowledge source" : "Assign to a category"}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-md hover:bg-muted transition-colors p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── STEP 1: SOURCE CONFIG ── */}
        {step === "source" && (
          <>
            <div className="px-6 pt-5 pb-6 space-y-6">
              {/* Source type tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab("WEBSITE")}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left",
                    activeTab === "WEBSITE"
                      ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] text-[oklch(0.45_0.15_131.684)]"
                      : "border-border text-foreground hover:border-muted-foreground"
                  )}
                >
                  <Globe className={cn("size-4 shrink-0", activeTab === "WEBSITE" ? "text-[oklch(0.648_0.2_131.684)]" : "text-muted-foreground")} />
                  Website
                </button>
                <button
                  onClick={() => setActiveTab("FILES")}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left",
                    activeTab === "FILES"
                      ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] text-[oklch(0.45_0.15_131.684)]"
                      : "border-border text-foreground hover:border-muted-foreground"
                  )}
                >
                  <Upload className={cn("size-4 shrink-0", activeTab === "FILES" ? "text-[oklch(0.648_0.2_131.684)]" : "text-muted-foreground")} />
                  Files
                </button>
                <button
                  onClick={() => setActiveTab("HELPDESK")}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left",
                    activeTab === "HELPDESK"
                      ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] text-[oklch(0.45_0.15_131.684)]"
                      : "border-border text-foreground hover:border-muted-foreground"
                  )}
                >
                  <Headphones className={cn("size-4 shrink-0", activeTab === "HELPDESK" ? "text-[oklch(0.648_0.2_131.684)]" : "text-muted-foreground")} />
                  Helpdesk
                </button>
              </div>

              {/* WEBSITE */}
              {activeTab === "WEBSITE" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground -mt-2">Crawl and index pages from a URL</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-sm font-medium text-foreground">Website URL</label>
                      <Input
                        placeholder="https://docs.example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">Pages will be crawled and indexed once your agent is created.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Scrape mode</label>
                      <div className="grid grid-cols-2 rounded-lg border border-border overflow-hidden h-10">
                        <button
                          onClick={() => setScrapeMode("simple")}
                          className={cn(
                            "text-sm font-medium transition-colors",
                            scrapeMode === "simple"
                              ? "bg-[oklch(0.648_0.2_131.684)] text-white"
                              : "bg-background text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Simple HTML
                        </button>
                        <button
                          onClick={() => setScrapeMode("full")}
                          className={cn(
                            "text-sm font-medium transition-colors",
                            scrapeMode === "full"
                              ? "bg-[oklch(0.648_0.2_131.684)] text-white"
                              : "bg-background text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Full page (renders JS)
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {scrapeMode === "simple" ? "Fast and cost-effective. Works for most static sites." : "Renders JS before scraping. Best for SPAs."}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Max depth</label>
                      <Input
                        type="number"
                        value={maxDepth}
                        onChange={(e) => setMaxDepth(e.target.value)}
                        className="h-10 w-full"
                        min={1}
                        max={20}
                      />
                      <p className="text-xs text-muted-foreground">How many link hops deep to follow from the start URL.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Max pages</label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {MAX_PAGES_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setMaxPages(opt)}
                            className={cn(
                              "px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                              maxPages === opt
                                ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] text-[oklch(0.45_0.15_131.684)]"
                                : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <SyncScheduleSelect value={syncSchedule} onChange={setSyncSchedule} open={syncOpen} setOpen={setSyncOpen} />
                  </div>
                </div>
              )}

              {/* FILES */}
              {activeTab === "FILES" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground -mt-2">Upload PDFs, docs, or text files</p>
                  <div className="grid grid-cols-3 gap-6 items-start">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "col-span-2 border-2 border-dashed rounded-lg py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
                        dragOver
                          ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)]"
                          : "border-border hover:border-muted-foreground bg-background"
                      )}
                    >
                      <input ref={fileInputRef} type="file" multiple className="hidden" accept=".pdf,.docx,.txt,.md,.html" />
                      <Upload className="size-7 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
                        <div className="flex items-center gap-1.5 justify-center mt-1.5 flex-wrap">
                          {["PDF", "DOCX", "TXT", "MD", "HTML"].map((fmt) => (
                            <span key={fmt} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                              {fmt}
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground">· max 50 MB each</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <SyncScheduleSelect value={syncSchedule} onChange={setSyncSchedule} open={syncOpen} setOpen={setSyncOpen} />
                    </div>
                  </div>
                </div>
              )}

              {/* HELPDESK */}
              {activeTab === "HELPDESK" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground -mt-2">Sync articles from your help desk</p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Choose your help desk platform</p>
                    <div className="grid grid-cols-3 gap-3">
                      {HELPDESK_PLATFORMS.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => setSelectedPlatform(platform.id)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-lg border text-sm font-medium transition-all text-left",
                            selectedPlatform === platform.id
                              ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)]"
                              : "border-border hover:border-muted-foreground"
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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-border">
              <Button
                onClick={handleSourceNext}
                disabled={!canSubmitSource}
                className={cn(
                  "bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white",
                  !canSubmitSource && "opacity-50 cursor-not-allowed"
                )}
              >
                {sourceSubmitLabel}
              </Button>
            </div>
          </>
        )}

        {/* ── STEP 2: CATEGORY PICKER ── */}
        {step === "category" && (
          <>
            <div className="px-6 pt-5 pb-6 space-y-5">
              <p className="text-sm text-muted-foreground">
                Assign this knowledge base to an existing category or create a new one.
              </p>

              {/* Existing categories */}
              {!isCreatingNew && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Existing categories</p>
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {existingCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left",
                          selectedCategory === cat
                            ? "border-[oklch(0.648_0.2_131.684)] bg-[oklch(0.97_0.025_131.684)] text-[oklch(0.45_0.15_131.684)]"
                            : "border-border text-foreground hover:border-muted-foreground"
                        )}
                      >
                        <FolderOpen className={cn("size-4 shrink-0", selectedCategory === cat ? "text-[oklch(0.648_0.2_131.684)]" : "text-muted-foreground")} />
                        <span className="truncate">{cat}</span>
                        {selectedCategory === cat && <Check className="size-3.5 ml-auto shrink-0 text-[oklch(0.648_0.2_131.684)]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              {!isCreatingNew && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {/* Create new category */}
              {isCreatingNew ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New category</p>
                  <Input
                    autoFocus
                    placeholder="e.g. Engineering, Legal, Finance..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing && newCategoryName.trim()) {
                        handleCategorySubmit()
                      }
                    }}
                    className="h-10"
                  />
                  <button
                    onClick={() => { setIsCreatingNew(false); setNewCategoryName("") }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to existing categories
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsCreatingNew(true); setSelectedCategory("") }}
                  className="flex items-center gap-2 text-sm font-medium text-[oklch(0.648_0.2_131.684)] hover:text-[oklch(0.58_0.2_131.684)] transition-colors"
                >
                  <Plus className="size-4" />
                  Create new category
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <button
                onClick={() => setStep("source")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
              <Button
                onClick={handleCategorySubmit}
                disabled={!canSubmitCategory}
                className={cn(
                  "bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white",
                  !canSubmitCategory && "opacity-50 cursor-not-allowed"
                )}
              >
                {isCreatingNew ? "Create & assign" : "Assign to category"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
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
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
        <Clock className="size-3.5 text-muted-foreground" />
        Sync schedule
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground hover:border-muted-foreground transition-colors"
        >
          <span>{selected?.label ?? "Manual only"}</span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md overflow-hidden">
            {SYNC_SCHEDULES.map((s) => (
              <button
                key={s.value}
                onClick={() => { onChange(s.value); setOpen(false) }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
                  value === s.value && "bg-muted font-medium"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">How often this source automatically re-syncs.</p>
    </div>
  )
}
