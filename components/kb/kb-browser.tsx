"use client"

import { useState } from "react"
import {
  ChevronRight, Globe, Plug, FileText, Headphones,
  Plus, FolderPlus, FilePlus, Loader2, FileSearch, MousePointerClick,
  Search, X,
} from "lucide-react"
import { KB_SOURCES, type KbSource, type KbDocument } from "@/lib/kb-mock"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/kb-tree"
import { AddSourcePage } from "./add-source-page"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDocTitle(doc: KbDocument): string {
  if (doc.source_filename) return doc.source_filename
  try {
    const url = new URL(doc.external_id)
    const segs = url.pathname.split("/").filter(Boolean)
    if (!segs.length) return url.hostname
    return segs[segs.length - 1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  } catch { return doc.external_id }
}

function SourceIcon({ type, className }: { type: string; className?: string }) {
  const cls = cn("size-3.5", className)
  if (type === "WEBSITE") return <Globe className={cls} />
  if (type === "INTEGRATION") return <Plug className={cls} />
  if (type === "FILES") return <FileText className={cls} />
  if (type === "HELPDESK") return <Headphones className={cls} />
  return <Globe className={cls} />
}

function StatusBadge({ status }: { status: string }) {
  if (status === "INDEXED")
    return <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[10px] px-1.5 py-0 h-5 gap-1"><span className="size-1.5 rounded-full bg-emerald-500" />Indexed</Badge>
  if (status === "SYNCING")
    return <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-[10px] px-1.5 py-0 h-5 gap-1"><Loader2 className="size-2.5 animate-spin" />Syncing</Badge>
  return <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50 text-[10px] px-1.5 py-0 h-5 gap-1"><span className="size-1.5 rounded-full bg-red-500" />Failed</Badge>
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface KbBrowserProps {
  initialCategory: string
  initialSourceId?: number
  onSelectDocument: (sourceId: number, docId: number, category: string) => void
  onBack: () => void
}

// ── Main Component ────────────────────────────────────────────────────────────

export function KbBrowser({ initialCategory, initialSourceId, onSelectDocument, onBack }: KbBrowserProps) {
  const [viewState, setViewState] = useState<"browser" | "create-source">("browser")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([initialCategory]))

  // Auto-select the requested source or fallback to the first source in the category
  const defaultSourceId = initialSourceId ?? KB_SOURCES.find((s) => s.category === initialCategory)?.id ?? null
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(defaultSourceId)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [addedCategories, setAddedCategories] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  // ── Data ──────────────────────────────────────────────────────────────────

  const categoriesByName = KB_SOURCES.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {} as Record<string, KbSource[]>)

  addedCategories.forEach((cat) => { if (!categoriesByName[cat]) categoriesByName[cat] = [] })

  const categories = Object.entries(categoriesByName)
    .map(([category, sources]) => {
      const filtered = searchQuery.trim()
        ? sources.filter((s) => {
            const q = searchQuery.toLowerCase()
            return s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q)
          })
        : sources
      return [category, filtered] as [string, KbSource[]]
    })
    .filter(([, sources]) => !searchQuery.trim() || (sources as KbSource[]).length > 0)
    .sort(([a], [b]) => a.localeCompare(b))

  // When searching, auto-expand all categories that have matches
  const effectiveExpanded = searchQuery.trim()
    ? new Set([...expandedCategories, ...categories.map(([c]) => c)])
    : expandedCategories

  const selectedSource = selectedSourceId ? KB_SOURCES.find((s) => s.id === selectedSourceId) ?? null : null
  const totalResults = categories.reduce((sum, [, srcs]) => sum + (srcs as KbSource[]).length, 0)

  // ── Handlers ─────────────────────────────────────────────────────────────

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  function handleCreateCategory() {
    const trimmed = newCategoryName.trim()
    if (trimmed && !categoriesByName[trimmed]) setAddedCategories((p) => [...p, trimmed])
    setNewCategoryName("")
    setIsCategoryModalOpen(false)
  }

  function handleAddSource(sourceData: { name: string; url: string; type: "WEBSITE" | "FILES" | "HELPDESK"; category: string }) {
    const newSource: KbSource = {
      id: Math.max(...KB_SOURCES.map((s) => s.id), 0) + 1,
      name: sourceData.name, url: sourceData.url, type: sourceData.type,
      status: "SYNCING", category: sourceData.category || initialCategory,
      documents: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      syncProgress: { status: "in-progress", current: 0, total: 100, percentage: 0, startedAt: new Date().toISOString() },
    }
    KB_SOURCES.push(newSource)
    setRefreshKey((k) => k + 1)
    setExpandedCategories((p) => new Set(p).add(newSource.category))
    setSelectedSourceId(newSource.id)
    setViewState("browser")
  }

  // ── Create-Source view ────────────────────────────────────────────────────

  if (viewState === "create-source") {
    return <AddSourcePage onBack={() => setViewState("browser")} onAdd={handleAddSource} />
  }

  // ── Browser view ──────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" key={refreshKey}>

      {/* Header */}
      <div className="mb-5 shrink-0">
        <nav className="flex items-center gap-1 text-sm mb-1" aria-label="Breadcrumb">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">Knowledge Base</button>
          <ChevronRight className="size-3.5 text-muted-foreground" />
          <span className="text-foreground font-medium">{initialCategory}</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Browse categories and sources to view indexed documents.</p>
          </div>
          <Button onClick={() => setViewState("create-source")} className="gap-1.5 bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white shadow-sm">
            <Plus className="size-4" />New
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources by name or URL…"
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <span className="text-xs text-muted-foreground">
            {totalResults} source{totalResults !== 1 ? "s" : ""} found
          </span>
        )}
      </div>

      {/* Two-pane layout */}
      <div className="flex flex-1 min-h-0 border border-border rounded-xl overflow-hidden bg-background shadow-sm">

        {/* LEFT SIDEBAR */}
        <aside className="w-64 shrink-0 border-r border-border flex flex-col bg-muted/20">
          <div className="px-4 py-3 border-b border-border shrink-0 bg-muted/40">
            <p className="text-sm font-semibold text-foreground">Categories &amp; Sources</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-1">
              {categories.length === 0 && searchQuery.trim() ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
                  <FileSearch className="size-5 text-muted-foreground opacity-40" />
                  <p className="text-xs text-muted-foreground">No sources match your search.</p>
                  <button onClick={() => setSearchQuery("")} className="text-xs text-[oklch(0.648_0.2_131.684)] hover:underline">Clear search</button>
                </div>
              ) : (
                categories.map(([category, sources]) => {
                  const isExpanded = effectiveExpanded.has(category)
                  return (

                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                        isExpanded ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      <ChevronRight className={cn("size-3.5 shrink-0 transition-transform duration-200", isExpanded && "rotate-90")} />
                      <span className="flex-1 text-[13px] font-semibold truncate">{category}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">{sources.length}</span>
                    </button>

                    <div className={cn("overflow-hidden transition-all duration-200 ease-in-out", isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0")}>
                      <div className="ml-5 border-l border-border/50">
                        {sources.length === 0 ? (
                          <p className="text-xs text-muted-foreground px-3 py-2 italic">No sources yet</p>
                        ) : (
                          sources.map((source) => {
                            const isSel = selectedSourceId === source.id
                            return (
                              <button
                                key={source.id}
                                onClick={() => setSelectedSourceId(source.id)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors",
                                  isSel
                                    ? "bg-[oklch(0.648_0.2_131.684)]/10 text-[oklch(0.35_0.15_131.684)] font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                )}
                              >
                                <SourceIcon type={source.type} className={cn("shrink-0", isSel ? "text-[oklch(0.648_0.2_131.684)]" : "text-muted-foreground")} />
                                <span className="flex-1 truncate">{source.name}</span>
                                <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">{source.documents.length}</span>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
              )}
            </div>
          </ScrollArea>
        </aside>


        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 min-w-0 flex flex-col bg-background">
          {selectedSource ? (
            <>
              {/* Subtle source label — no box, no button */}
              <div className="px-6 py-3 border-b border-border shrink-0 flex items-center gap-2">
                <SourceIcon type={selectedSource.type} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{selectedSource.name}</span>
                <StatusBadge status={selectedSource.status} />
                <span className="text-xs text-muted-foreground ml-auto">
                  {selectedSource.documents.length} document{selectedSource.documents.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Document list */}
              <ScrollArea className="flex-1">
                {selectedSource.documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground px-8 text-center">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                      <FileSearch className="size-5 opacity-40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No documents yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedSource.status === "SYNCING"
                          ? "Documents will appear here once syncing completes."
                          : "This source has not indexed any documents yet."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {selectedSource.documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => onSelectDocument(selectedSource.id, doc.id, selectedSource.category)}
                        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
                          <FileText className="size-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{getDocTitle(doc)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Synced {formatRelativeTime(doc.updated_at)}
                            {doc.parent_chunk_count > 0 && <> &middot; {doc.parent_chunk_count} chunks</>}
                          </p>
                        </div>
                        <StatusBadge status={doc.status} />
                        <ChevronRight className="size-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
                <MousePointerClick className="size-6 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Select a source</p>
                <p className="text-xs text-muted-foreground mt-1">Choose a source from the sidebar to view its documents.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Category modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create New Category</DialogTitle></DialogHeader>
          <div className="py-4">
            <Input placeholder="e.g. Engineering, Marketing, HR" value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateCategory() }} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}
              className="bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
