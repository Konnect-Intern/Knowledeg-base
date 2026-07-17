"use client"

import { useState } from "react"
// 🌟 ADDED: Imported RefreshCw for the sync icon
import { Globe, Plug, LayoutGrid, List, Plus, MoreVertical, Pencil, Trash2, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KB_SOURCES, type KbSource } from "@/lib/kb-mock"
import { formatRelativeTime } from "@/lib/kb-tree"
import { cn } from "@/lib/utils"

import { AddSourcePage } from "./add-source-page"

interface KnowledgeBaseListProps {
  onSelectSource: (sourceId: number) => void
  onEditSource?: (sourceId: number) => void
  // 🌟 ADDED: Optional prop if you want to handle syncing at a higher level later
  onSyncSource?: (sourceId: number) => void
  category?: string
  onBack?: () => void
  onAddSource?: (source: KbSource) => void
}

function StatusDot({ status }: { status: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block size-2 rounded-full",
          status === "INDEXED" && "bg-[oklch(0.648_0.2_131.684)]",
          status === "SYNCING" && "bg-amber-400",
          status === "FAILED" && "bg-red-500"
        )}
      />
      <span className="text-sm text-muted-foreground capitalize">
        {status === "INDEXED" ? "Active" : status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    </span>
  )
}

function SourceTypeIcon({ type }: { type: string }) {
  return type === "WEBSITE" ? (
    <Globe className="size-4 text-muted-foreground" />
  ) : (
    <Plug className="size-4 text-muted-foreground" />
  )
}

export function KnowledgeBaseList({ onSelectSource, onEditSource, onSyncSource, category, onBack, onAddSource }: KnowledgeBaseListProps) {
  const [viewState, setViewState] = useState<"list" | "create-source">("list")

  const [view, setView] = useState<"cards" | "table">("cards")
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())
  const [addedSources, setAddedSources] = useState<KbSource[]>([])
  const [statusFilter, setStatusFilter] = useState<"ALL" | "INDEXED" | "SYNCING">("ALL")

  // Force a re-render when we manually trigger a sync
  const [refreshKey, setRefreshKey] = useState(0)

  let baseSources = [...addedSources, ...KB_SOURCES.filter((s) => !deletedIds.has(s.id))]

  if (category) {
    baseSources = baseSources.filter((s) => s.category === category)
  }

  const sources = baseSources.filter((s) => {
    if (statusFilter === "INDEXED") return s.status === "INDEXED"
    if (statusFilter === "SYNCING") return s.status === "SYNCING"
    return true // "ALL"
  })

  function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    setDeletedIds((prev) => new Set(prev).add(id))
  }

  function handleEdit(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    onEditSource?.(id)
  }

  // 🌟 NEW: Handle Sync Click
  function handleSync(e: React.MouseEvent, id: number) {
    e.stopPropagation()

    // Update local added sources if it exists there
    setAddedSources((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: "SYNCING" } : s)
    )

    // Update global mock data so it persists across views
    const globalSource = KB_SOURCES.find((s) => s.id === id)
    if (globalSource) {
      globalSource.status = "SYNCING"
    }

    onSyncSource?.(id)

    // Switch to the Syncing tab automatically so the user sees it processing
    setStatusFilter("SYNCING")
    setRefreshKey((k) => k + 1)
  }

  function handleAddSource(sourceData: { name: string; url: string; type: "WEBSITE" | "FILES" | "HELPDESK"; category: string }) {
    const newSource: KbSource = {
      id: Math.max(...KB_SOURCES.map((s) => s.id), ...addedSources.map((s) => s.id), 0) + 1,
      name: sourceData.name,
      url: sourceData.url,
      type: sourceData.type,
      status: "SYNCING",
      category: sourceData.category || category || "General",
      documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      syncProgress: {
        status: "in-progress",
        current: 0,
        total: 100,
        percentage: 0,
        startedAt: new Date().toISOString(),
      },
    }

    KB_SOURCES.push(newSource)
    setAddedSources((prev) => [newSource, ...prev])
    onAddSource?.(newSource)

    setStatusFilter("ALL")
    setViewState("list")
  }

  if (viewState === "create-source") {
    return (
      <AddSourcePage
        category={category}
        onBack={() => setViewState("list")}
        onAdd={handleAddSource}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full" key={refreshKey}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Knowledge Base
        </button>
        {category && (
          <>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">{category}</span>
          </>
        )}
      </nav>

      <div className="flex flex-col gap-5 -mt-3">
        {/* Top Row: Title and Main Action */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {category ?? "Knowledge Base"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {category ? `Manage sources in the ${category} category.` : "Manage your knowledge sources for AI agents."}
            </p>
          </div>
          <Button
            onClick={() => setViewState("create-source")}
            className="gap-1.5 bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white shrink-0 shadow-sm"
          >
            <Plus className="size-4" />
            New
          </Button>
        </div>

        {/* Bottom Row: Filters and View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 h-9">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={cn(
                "px-4 h-full rounded-sm text-sm font-medium transition-colors shrink-0",
                statusFilter === "ALL"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("INDEXED")}
              className={cn(
                "px-4 h-full rounded-sm text-sm font-medium transition-colors shrink-0",
                statusFilter === "INDEXED"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("SYNCING")}
              className={cn(
                "px-4 h-full rounded-sm text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0",
                statusFilter === "SYNCING"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              In Progress
            </button>
          </div>

          <div className="flex items-center rounded-md border border-border bg-muted p-0.5 h-9">
            <button
              onClick={() => setView("cards")}
              className={cn(
                "flex items-center justify-center w-9 h-full rounded-sm transition-colors shrink-0",
                view === "cards"
                  ? "bg-background shadow-sm text-[oklch(0.648_0.2_131.684)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Card view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "flex items-center justify-center w-9 h-full rounded-sm transition-colors shrink-0",
                view === "table"
                  ? "bg-background shadow-sm text-[oklch(0.648_0.2_131.684)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Table view"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {sources.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 h-40 border border-dashed border-border rounded-lg bg-card/50">
          <p className="text-sm text-muted-foreground">No sources found for this view.</p>
        </div>
      )}

      {/* ── CARDS VIEW ── */}
      {view === "cards" && sources.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card
              key={source.id}
              className="cursor-pointer border border-border hover:border-[oklch(0.648_0.2_131.684)] hover:shadow-sm transition-all"
              onClick={() => onSelectSource(source.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                      <SourceTypeIcon type={source.type} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{source.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-medium",
                        source.status === "INDEXED" &&
                        "bg-[oklch(0.96_0.04_131.684)] text-[oklch(0.3_0.1_131.684)]"
                      )}
                    >
                      {source.status === "INDEXED" ? "Active" : source.status.charAt(0) + source.status.slice(1).toLowerCase()}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center size-6 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          aria-label="More options"
                        >
                          <MoreVertical className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">

                        {/* 🌟 ADDED: Sync Option */}
                        <DropdownMenuItem onClick={(e) => handleSync(e, source.id)}>
                          <RefreshCw className="size-3.5 mr-2" />
                          Sync
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={(e) => handleEdit(e, source.id)}>
                          <Pencil className="size-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(e, source.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="size-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{source.documents.length} documents</span>
                  <span>·</span>
                  <span className="capitalize">
                    {source.type.charAt(0) + source.type.slice(1).toLowerCase()}
                  </span>
                  <span>·</span>
                  <span>synced {formatRelativeTime(source.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {view === "table" && sources.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-medium">Name</TableHead>
                <TableHead className="text-xs font-medium">Type</TableHead>
                <TableHead className="text-xs font-medium">Status</TableHead>
                <TableHead className="text-xs font-medium text-right">Documents</TableHead>
                <TableHead className="text-xs font-medium text-right">Last Synced</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow
                  key={source.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => onSelectSource(source.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded border border-border bg-muted">
                        <SourceTypeIcon type={source.type} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{source.name}</p>
                        <p className="text-xs text-muted-foreground">{source.url}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {source.type.charAt(0) + source.type.slice(1).toLowerCase()}
                  </TableCell>
                  <TableCell>
                    <StatusDot status={source.status} />
                  </TableCell>
                  <TableCell className="text-sm text-right">{source.documents.length}</TableCell>
                  <TableCell className="text-sm text-muted-foreground text-right">
                    {formatRelativeTime(source.updated_at)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex items-center justify-center size-7 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          aria-label="More options"
                        >
                          <MoreVertical className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">

                        {/* 🌟 ADDED: Sync Option */}
                        <DropdownMenuItem onClick={(e) => handleSync(e, source.id)}>
                          <RefreshCw className="size-3.5 mr-2" />
                          Sync
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={(e) => handleEdit(e, source.id)}>
                          <Pencil className="size-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(e, source.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="size-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}