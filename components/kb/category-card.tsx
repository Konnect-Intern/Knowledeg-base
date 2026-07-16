"use client"

import { Folder } from "lucide-react"
import { KbSource } from "@/lib/kb-mock"

interface CategoryCardProps {
  category: string
  sources: KbSource[]
  onClick: () => void
}

const CATEGORY_DESCRIPTIONS = {
  Business: "Public websites and product marketing...",
  Communication: "Chat and messaging platforms...",
  Documentation: "Company handbooks, memos, and intern...",
  Healthcare: "Medical systems and patient data...",
  Support: "Help centers and support-facing content.",
}

export function CategoryCard({
  category,
  sources,
  onClick,
}: CategoryCardProps) {
  const maxVisible = 3
  const visibleSources = sources.slice(0, maxVisible)
  const remainingCount = sources.length - maxVisible
  const description = CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || "Knowledge bases..."

  return (
    <button
      onClick={onClick}
      className="h-[240px] text-left p-4 rounded-lg border border-border bg-card hover:border-[oklch(0.648_0.2_131.684)] hover:shadow-md transition-all flex flex-col"
    >
      {/* Header: Folder icon + name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 mt-0.5">
          <Folder className="w-6 h-6 text-[oklch(0.648_0.2_131.684)]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{category}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Sources label */}
      <p className="text-xs font-medium text-muted-foreground mb-2">Sources ({sources.length})</p>

      {/* Sources list with file icons */}
      <div className="space-y-1.5 flex-1 overflow-hidden">
        {visibleSources.map((source) => (
          <div
            key={source.id}
            className="flex items-center gap-2 text-xs text-foreground truncate"
          >
            <span className="text-sm flex-shrink-0">📄</span>
            <span className="truncate">{source.name}</span>
          </div>
        ))}

        {/* "+ X more" indicator */}
        {remainingCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium pt-1 border-t border-border/50 mt-1">
            <span>+</span>
            <span>{remainingCount} more</span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {sources.length === 0 && (
        <div className="flex items-center justify-center flex-1 text-xs text-muted-foreground">
          No knowledge bases yet.
        </div>
      )}
    </button>
  )
}
