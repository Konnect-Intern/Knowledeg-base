'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, Folder, FileText } from 'lucide-react'
import { KbSource } from '@/lib/kb-mock'

interface KnowledgeBaseSidebarProps {
  sources: KbSource[]
  selectedSourceId?: number
  onSelectSource: (sourceId: number) => void
}

export function KnowledgeBaseSidebar({
  sources,
  selectedSourceId,
  onSelectSource,
}: KnowledgeBaseSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(sources.map((s) => s.category))
  )

  // Group sources by category
  const groupedByCategory = useMemo(() => {
    const groups: { [key: string]: KbSource[] } = {}
    sources.forEach((source) => {
      if (!groups[source.category]) {
        groups[source.category] = []
      }
      groups[source.category].push(source)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [sources])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-bold text-foreground">Knowledge Base</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {sources.length} sources
        </p>
      </div>

      {/* Scrollable Categories and Sources */}
      <div className="flex-1 overflow-y-auto">
        {groupedByCategory.map(([category, categorySources]) => (
          <div key={category} className="border-b border-border last:border-b-0">
            {/* Category Header - Expandable */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-muted transition-colors text-left"
            >
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  expandedCategories.has(category) ? '' : '-rotate-90'
                }`}
              />
              <Folder className="w-4 h-4 text-[oklch(0.648_0.2_131.684)]" />
              <span className="text-sm font-medium text-foreground truncate">
                {category}
              </span>
              <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                {categorySources.length}
              </span>
            </button>

            {/* Expanded Sources List */}
            {expandedCategories.has(category) && (
              <div className="bg-muted/30">
                {categorySources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => onSelectSource(source.id)}
                    className={`w-full px-8 py-2 flex items-start gap-2 hover:bg-muted transition-colors text-left border-l-2 ${
                      selectedSourceId === source.id
                        ? 'border-l-[oklch(0.648_0.2_131.684)] bg-muted'
                        : 'border-l-transparent'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {source.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {source.documents?.length || 0} pages
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
