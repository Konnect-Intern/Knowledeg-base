'use client'

import { KbSource, KbDocument } from '@/lib/kb-mock'
import { FileText, Globe, Database, AlertCircle } from 'lucide-react'

interface KnowledgeBaseSourceListProps {
  source?: KbSource
  selectedDocumentId?: number
  onSelectDocument: (documentId: number) => void
}

export function KnowledgeBaseSourceList({
  source,
  selectedDocumentId,
  onSelectDocument,
}: KnowledgeBaseSourceListProps) {
  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'WEBSITE':
        return <Globe className="w-4 h-4 text-blue-500" />
      case 'INTEGRATION':
        return <Database className="w-4 h-4 text-purple-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INDEXED':
        return 'bg-green-100 text-green-800'
      case 'SYNCING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!source) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">Select a source to view documents</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Source Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-start gap-3">
          {getSourceIcon(source.type)}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate">{source.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">{source.url}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(source.status)}`}>
                {source.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {source.documents?.length || 0} documents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        {!source.documents || source.documents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs text-muted-foreground">No documents indexed yet</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {source.documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors ${
                  selectedDocumentId === doc.id ? 'bg-muted border-l-2 border-l-[oklch(0.648_0.2_131.684)]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {doc.external_id.split('/').pop() || doc.external_id}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {doc.extracted_text.substring(0, 80)}...
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(doc.content_bytes / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
