'use client'

import { useState } from 'react'
import { KbSource } from '@/lib/kb-mock'
import { KnowledgeBaseSidebar } from './knowledge-base-sidebar'
import { KnowledgeBaseSourceList } from './knowledge-base-source-list'

interface KnowledgeBaseWithSidebarProps {
  sources: KbSource[]
  onSelectDocument: (sourceId: number, documentId: number) => void
  onBack?: () => void
}

export function KnowledgeBaseWithSidebar({
  sources,
  onSelectDocument,
  onBack,
}: KnowledgeBaseWithSidebarProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<number | undefined>()
  const selectedSource = sources.find((s) => s.id === selectedSourceId)

  const handleSelectSource = (sourceId: number) => {
    setSelectedSourceId(sourceId)
  }

  const handleSelectDocument = (documentId: number) => {
    if (selectedSource) {
      onSelectDocument(selectedSource.id, documentId)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="px-6 py-4 border-b border-border bg-background flex items-center gap-2">
        {onBack && (
          <>
            <button
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Knowledge Base
            </button>
            <span className="text-muted-foreground">/</span>
          </>
        )}
        <span className="text-sm font-medium text-foreground">Browse Sources</span>
      </div>

      {/* Main Layout - Two Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Categories and Sources */}
        <div className="w-64 flex-shrink-0 border-r border-border overflow-hidden">
          <KnowledgeBaseSidebar
            sources={sources}
            selectedSourceId={selectedSourceId}
            onSelectSource={handleSelectSource}
          />
        </div>

        {/* Main Content - Document List */}
        <div className="flex-1 overflow-hidden">
          <KnowledgeBaseSourceList
            source={selectedSource}
            onSelectDocument={handleSelectDocument}
          />
        </div>
      </div>
    </div>
  )
}
