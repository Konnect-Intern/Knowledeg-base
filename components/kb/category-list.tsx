"use client"

import { useState } from "react"
import { Plus, FolderPlus, FilePlus, FileEdit, ExternalLink } from "lucide-react"
import { KB_SOURCES, type KbSource, type KbDocument } from "@/lib/kb-mock"
import { getDocTitle, formatRelativeTime } from "@/lib/kb-tree"
import { CategoryCard } from "./category-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddSourcePage } from "./add-source-page"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// 🌟 REMOVED: AddSourceModal import is completely gone

interface CategoryListProps {
  onSelectCategory: (category: string) => void
  onSelectSource: (sourceId: number, category: string) => void
  onSelectDocument: (sourceId: number, docId: number, category: string) => void
  onBack: () => void
}

export function CategoryList({ onSelectCategory, onSelectSource, onSelectDocument, onBack }: CategoryListProps) {
  // Track views and categories
  const [viewState, setViewState] = useState<"list" | "create-source">("list")
  const [addedCategories, setAddedCategories] = useState<string[]>([])

  // Category Modal state (Keep this, as it's for creating folders)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  // 🌟 REMOVED: isSourceModalOpen state is completely deleted

  // Force a re-render when a new source is pushed to the global array
  const [refreshKey, setRefreshKey] = useState(0)

  // Group existing sources by category
  const categoriesByName = KB_SOURCES.reduce(
    (acc, source) => {
      if (!acc[source.category]) {
        acc[source.category] = []
      }
      acc[source.category].push(source)
      return acc
    },
    {} as Record<string, typeof KB_SOURCES>
  )

  // Inject user-created empty categories into the view
  addedCategories.forEach((cat) => {
    if (!categoriesByName[cat]) {
      categoriesByName[cat] = []
    }
  })

  // Sort alphabetically
  const categories = Object.entries(categoriesByName).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  // Find all drafted documents globally
  const draftedDocs = KB_SOURCES.flatMap(source => 
    source.documents
      .filter(doc => doc.status === "DRAFT")
      .map(doc => ({ doc, source }))
  ).sort((a, b) => new Date(b.doc.updated_at).getTime() - new Date(a.doc.updated_at).getTime())

  function handleCreateCategory() {
    const trimmed = newCategoryName.trim()
    if (trimmed && !categoriesByName[trimmed]) {
      setAddedCategories((prev) => [...prev, trimmed])
    }
    setNewCategoryName("")
    setIsCategoryModalOpen(false)
  }

  function handleCreateSource(sourceData: { name: string; url: string; type: "WEBSITE" | "FILES" | "HELPDESK"; category: string }) {
    const newSource: KbSource = {
      id: Math.max(...KB_SOURCES.map((s) => s.id), 0) + 1,
      name: sourceData.name,
      url: sourceData.url,
      type: sourceData.type,
      status: "SYNCING",
      category: sourceData.category || "General",
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
    setRefreshKey((k) => k + 1)

    // 🌟 CHANGED: Go back to list view instead of closing a modal
    setViewState("list")
  }

  // 🌟 NEW PAGE RENDER: This catches the view state and takes over the screen
  if (viewState === "create-source") {
    return (
      <AddSourcePage
        onBack={() => setViewState("list")}
        onAdd={handleCreateSource}
      />
    )
  }

  return (
    <div className="h-full flex flex-col" key={refreshKey}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-1" aria-label="Breadcrumb">
        <span className="text-foreground font-medium">Knowledge Base</span>
      </nav>

      {/* Header with Actions */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">Choose a category to browse its knowledge bases.</p>
        </div>

        {/* Action Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button className="gap-1.5 bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white" />}>
            <Plus className="size-4" />
            New
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsCategoryModalOpen(true)} className="cursor-pointer">
              <FolderPlus className="size-4 mr-2 text-muted-foreground" />
              New Category
            </DropdownMenuItem>

            {/* 🌟 CORRECT TRIGGER: Updates view state */}
            <DropdownMenuItem onClick={() => setViewState("create-source")} className="cursor-pointer">
              <FilePlus className="size-4 mr-2 text-muted-foreground" />
              New Knowledge
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── My Drafts Section ── */}
      {draftedDocs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            My Drafts
            <Badge variant="secondary" className="rounded-full px-1.5 py-0 h-4 text-[10px]">{draftedDocs.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {draftedDocs.map(({ doc, source }) => (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(source.id, doc.id, source.category)}
                className="group relative flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-purple-300 hover:shadow-sm"
              >
                <div className="flex w-full items-start justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                      <FileEdit className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{getDocTitle(doc.external_id, doc.source_filename)}</h3>
                      <p className="text-xs text-muted-foreground truncate">{source.name}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Drafted {formatRelativeTime(doc.updated_at)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories grid */}
      <div className="flex-1 overflow-auto">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 gap-2 text-muted-foreground">
            <p className="text-sm">No knowledge bases available.</p>
          </div>
        ) : (
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {categories.map(([category, sources]) => (
    <CategoryCard
      key={category}
      category={category}
      sources={sources}
      onViewAll={() => onSelectCategory(category)}
      onSelectSource={(sourceId) => onSelectSource(sourceId, category)}
      onSelectCategory={() => onSelectCategory(category)}
    />
  ))}
</div>
        )}
      </div>

      {/* ── MODALS ── */}

      {/* 1. New Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g. Engineering, Marketing, HR"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCategory()
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              className="bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🌟 REMOVED: <AddSourceModal /> was sitting here blocking the logic, it is now gone! */}
    </div>
  )
}
