"use client"

import { Folder, FileText } from "lucide-react"
import { KbSource } from "@/lib/kb-mock"

interface CategoryCardProps {
  category: string
  sources: KbSource[]
  onViewAll: () => void
  onSelectSource: (sourceId: number) => void
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
  onViewAll,
  onSelectSource,
}: CategoryCardProps) {
  const maxVisible = 3
  const visibleSources = sources.slice(0, maxVisible)
  const remainingCount = sources.length - maxVisible
  const description = CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || "Knowledge bases and documents..."

  return (
    <div className="h-[260px] p-5 rounded-xl border border-border bg-card hover:border-[oklch(0.648_0.2_131.684)] hover:shadow-sm transition-all flex flex-col">
      
      {/* Header: Folder icon + name + description */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 mt-0.5">
          <Folder className="w-5 h-5 text-[oklch(0.648_0.2_131.684)]" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{category}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{description}</p>
        </div>
      </div>

      {/* Sources label */}
      <p className="text-xs font-medium text-muted-foreground mb-3">Sources ({sources.length})</p>

      {/* Sources list with direct interactive rows */}
      <div className="space-y-1 flex-1 overflow-hidden">
        {visibleSources.map((source) => (
          <button
            key={source.id}
            onClick={() => onSelectSource(source.id)}
            className="w-full group flex items-center justify-between px-2 py-1.5 -mx-2 rounded-md hover:bg-muted/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium text-foreground/90 group-hover:text-foreground truncate transition-colors">
                {source.name}
              </span>
            </div>
            
            {/* Standard single digit/integer count format */}
            <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors shrink-0 pl-2">
              {source.documents?.length || 0} docs
            </span>
          </button>
        ))}

        {/* Empty state */}
        {sources.length === 0 && (
          <div className="flex items-center justify-center pt-4 text-xs text-muted-foreground">
            No sources yet.
          </div>
        )}
      </div>

      {/* Footer "View All" link */}
      {remainingCount > 0 && (
        <div className="pt-3 border-t border-border/50 mt-2">
          <button 
            onClick={onViewAll}
            className="text-xs font-medium text-muted-foreground hover:text-[oklch(0.648_0.2_131.684)] transition-colors"
          >
            View all {sources.length} sources
          </button>
        </div>
      )}
    </div>
  )
}