"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  ChevronRight, Globe, Plug, ExternalLink, Pencil, Save, X, RefreshCw, FileText, Eye,
  Undo, Redo, Bold, Italic, Underline, Strikethrough, Code, SquareTerminal,
  Minus, List, ListOrdered, CheckSquare, Indent, Outdent
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { KB_SOURCES } from "@/lib/kb-mock"
import { buildUrlTree, formatRelativeTime, formatBytes, type TreeNode } from "@/lib/kb-tree"
import { UrlTree } from "./url-tree"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Recursive helper to auto-select the first valid document in the tree
function getFirstDocumentNode(node: TreeNode): TreeNode | null {
  if (node.document) return node
  for (const child of node.children) {
    const found = getFirstDocumentNode(child)
    if (found) return found
  }
  return null
}

interface KnowledgeBaseDetailProps {
  sourceId: number
  category?: string
  onBack: () => void
  onBackToCategories?: () => void
  openEditMode?: boolean
}

export function KnowledgeBaseDetail({ sourceId, category, onBack, onBackToCategories, openEditMode = false }: KnowledgeBaseDetailProps) {
  const source = KB_SOURCES.find((s) => s.id === sourceId)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const [isEditing, setIsEditing] = useState(openEditMode)
  const [editedContent, setEditedContent] = useState<string>("")
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);

  // 🌟 NEW: A trigger to force the component to re-render when data is saved
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const textareaRef = useRef<HTMLDivElement>(null)

  // When openEditMode changes, sync state
  useEffect(() => {
    setIsEditing(openEditMode)
  }, [openEditMode, sourceId])

  // When a node is selected, populate the editor with its content
  useEffect(() => {
    if (selectedNode?.document) {
      setEditedContent(selectedNode.document.extracted_text)
    }
  }, [selectedNode, refreshTrigger]) // Added refreshTrigger to dependencies

  const tree = useMemo(
    () => (source?.type === "WEBSITE" ? buildUrlTree(source.documents) : null),
    [source, refreshTrigger] // Re-build tree if data changes
  )

  // Auto-select the first valid document when the tree loads
  useEffect(() => {
    if (tree && !selectedNode) {
      const firstDoc = getFirstDocumentNode(tree)
      if (firstDoc) {
        setSelectedNode(firstDoc)
      }
    }
  }, [tree, selectedNode])

  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-2 text-muted-foreground">
        <p>Source not found.</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to list
        </Button>
      </div>
    )
  }

  const selectedDoc = selectedNode?.document ?? null

  // Save function — reads current HTML from the contentEditable div, strips tags to plain text
  const handleSave = () => {
    if (!selectedDoc) return

    // Grab the latest HTML from the contentEditable div if available
    const editorEl = textareaRef.current as HTMLDivElement | null
    const latestContent = editorEl ? (editorEl.innerHTML || editedContent) : editedContent

    selectedDoc.extracted_text = latestContent
    selectedDoc.updated_at = new Date().toISOString()

    setIsEditing(false)
    setRefreshTrigger(prev => prev + 1)
  }

  // Shared className for both HTML and markdown rendered output
  const viewerClass = "max-w-none text-foreground text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:leading-tight [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:leading-relaxed [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_hr]:border-border [&_hr]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3 [&_a]:text-[oklch(0.648_0.2_131.684)] [&_a]:hover:underline [&_code]:bg-muted [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-3 [&_input[type=checkbox]]:mr-1.5"

  // REUSABLE MARKDOWN COMPONENT — detects HTML (post-edit) vs raw markdown and renders accordingly
  const MarkdownViewer = ({ content }: { content: string }) => {
    const isHtml = /^\s*</.test(content)
    if (isHtml) {
      return <div className={viewerClass} dangerouslySetInnerHTML={{ __html: content }} />
    }
    return (
      <div className={viewerClass}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1>{children}</h1>,
            h2: ({ children }) => <h2>{children}</h2>,
            h3: ({ children }) => <h3>{children}</h3>,
            h4: ({ children }) => <h4>{children}</h4>,
            p: ({ children }) => <p>{children}</p>,
            ul: ({ children }) => <ul>{children}</ul>,
            ol: ({ children }) => <ol>{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
            strong: ({ children }) => <strong>{children}</strong>,
            em: ({ children }) => <em>{children}</em>,
            hr: () => <hr />,
            blockquote: ({ children }) => <blockquote>{children}</blockquote>,
            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
            code: ({ children, inline }: any) =>
              inline ? <code>{children}</code> : (
                <pre><code className="font-mono text-sm">{children}</code></pre>
              ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        <button
          onClick={onBackToCategories || onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Knowledge Base
        </button>
        {category && (
          <>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {category}
            </button>
          </>
        )}
        <ChevronRight className="size-3.5 text-muted-foreground" />
        <span className="text-foreground font-medium">{source.name}</span>
      </nav>

      {/* Syncing Progress Card */}
      {/* 🌟 Unified Source Card */}
      <div className="rounded-lg border border-border bg-card">
        {/* The header row - always visible */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
              {source.type === "WEBSITE" ? <Globe className="size-5 text-muted-foreground" /> : <Plug className="size-5 text-muted-foreground" />}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{source.name}</p>
              <p className="text-xs text-muted-foreground">
                {source.url} · {source.documents.length} documents
              </p>
            </div>
          </div>

          {/* Syncing status & Toggle */}
          <div className="flex items-center gap-4">
            {source.status === "SYNCING" ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-[oklch(0.648_0.2_131.684)] font-medium">
                  <RefreshCw className="size-3.5 animate-spin" /> Syncing
                </div>
                <button
                  onClick={() => setIsProgressExpanded(!isProgressExpanded)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  {isProgressExpanded ? "Hide progress" : "View progress"}
                </button>
              </>
            ) : (
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500 inline-block" />
                Indexed
              </Badge>
            )}
          </div>
        </div>

        {/* Progress bar inside the same card */}
        {isProgressExpanded && source.status === "SYNCING" && source.syncProgress && (
          <div className="px-4 pb-4 animate-in slide-in-from-top-1">
            <div className="bg-muted/30 rounded-md p-3 border border-border">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-medium text-[oklch(0.648_0.2_131.684)]">Scraping {source.syncProgress.current} of {source.syncProgress.total}</span>
                <span className="text-muted-foreground">{source.syncProgress.percentage}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full text-[oklch(0.648_0.2_131.684)]transition-all duration-300"
                  style={{ width: `${source.syncProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two-pane content */}
      {source.status !== "SYNCING" && source.type === "WEBSITE" && tree && (
        <div className="flex gap-4 flex-1 min-h-0">

          {/* Left: tree panel (Hidden entirely when editing for max screen space) */}
          {!isEditing && (
            <div className="w-[340px] shrink-0 rounded-lg border border-border bg-card flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pages
                </p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  <UrlTree
                    node={tree}
                    selectedDocId={selectedDoc?.id ?? null}
                    onSelectNode={(n) => {
                      setSelectedNode(n)
                      setIsEditing(false)
                    }}
                    depth={0}
                    defaultExpanded={true}
                  />
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Right: preview/edit panel */}
          <div className="flex-1 min-w-0 rounded-lg border border-border bg-card flex flex-col overflow-hidden shadow-sm">
            {selectedDoc ? (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4 bg-muted/10">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {isEditing ? "Editing Document" : selectedNode?.label}
                    </h2>
                    {!isEditing && (
                      <a
                        href={selectedDoc.external_id}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[oklch(0.648_0.2_131.684)] hover:underline w-fit mt-1 transition-colors"
                      >
                        {selectedDoc.external_id}
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-4 text-sm font-medium"
                          onClick={() => {
                            setIsEditing(false)
                            setEditedContent(selectedDoc.extracted_text) // Reset content back to original
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-9 px-5 text-sm font-medium bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white shadow-sm"
                          onClick={handleSave} // 🌟 Calls our new save function
                        >
                          <Save className="size-3.5 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="h-9 px-4 text-sm font-medium gap-2 bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white shadow-sm ring-2 ring-offset-2 ring-transparent hover:ring-[oklch(0.648_0.2_131.684)]/20 transition-all"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="size-3.5" />
                        Edit Document
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                {isEditing ? (
                  <div className="flex-1 flex flex-col min-h-0 bg-background">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/40 overflow-x-auto shrink-0">
                      <ToolbarButton icon={Undo} tooltip="Undo" onClick={() => document.execCommand('undo')} />
                      <ToolbarButton icon={Redo} tooltip="Redo" onClick={() => document.execCommand('redo')} />
                      <div className="w-px h-5 bg-border mx-1 shrink-0" />

                      <ToolbarButton icon={Bold} tooltip="Bold" onClick={() => document.execCommand('bold')} />
                      <ToolbarButton icon={Italic} tooltip="Italic" onClick={() => document.execCommand('italic')} />
                      <ToolbarButton icon={Underline} tooltip="Underline" onClick={() => document.execCommand('underline')} />
                      <ToolbarButton icon={Strikethrough} tooltip="Strikethrough" onClick={() => document.execCommand('strikeThrough')} />
                      <ToolbarButton icon={Code} tooltip="Inline Code" onClick={() => {
                        const sel = window.getSelection()
                        if (!sel || sel.rangeCount === 0) return
                        const range = sel.getRangeAt(0)
                        const code = document.createElement('code')
                        code.style.fontFamily = 'monospace'
                        code.style.background = 'rgba(0,0,0,0.06)'
                        code.style.padding = '1px 4px'
                        code.style.borderRadius = '3px'
                        range.surroundContents(code)
                      }} />
                      <ToolbarButton icon={SquareTerminal} tooltip="Code Block" onClick={() => {
                        const sel = window.getSelection()
                        if (!sel || sel.rangeCount === 0) return
                        const range = sel.getRangeAt(0)
                        const pre = document.createElement('pre')
                        pre.style.background = 'rgba(0,0,0,0.04)'
                        pre.style.padding = '12px'
                        pre.style.borderRadius = '6px'
                        pre.style.fontFamily = 'monospace'
                        pre.style.fontSize = '13px'
                        pre.style.overflowX = 'auto'
                        range.surroundContents(pre)
                      }} />

                      <div className="w-px h-5 bg-border mx-1 shrink-0" />

                      <ToolbarTextButton label="H1" tooltip="Heading 1" onClick={() => document.execCommand('formatBlock', false, 'h1')} />
                      <ToolbarTextButton label="H2" tooltip="Heading 2" onClick={() => document.execCommand('formatBlock', false, 'h2')} />
                      <ToolbarTextButton label="H3" tooltip="Heading 3" onClick={() => document.execCommand('formatBlock', false, 'h3')} />

                      <div className="w-px h-5 bg-border mx-1 shrink-0" />

                      <ToolbarButton icon={Minus} tooltip="Divider" onClick={() => document.execCommand('insertHorizontalRule')} />
                      <ToolbarButton icon={List} tooltip="Bullet List" onClick={() => document.execCommand('insertUnorderedList')} />
                      <ToolbarButton icon={ListOrdered} tooltip="Numbered List" onClick={() => document.execCommand('insertOrderedList')} />
                      <ToolbarButton icon={CheckSquare} tooltip="Task List" onClick={() => {
                        const sel = window.getSelection()
                        if (!sel || sel.rangeCount === 0) return
                        const range = sel.getRangeAt(0)
                        const label = document.createElement('label')
                        label.style.display = 'flex'
                        label.style.alignItems = 'center'
                        label.style.gap = '6px'
                        const cb = document.createElement('input')
                        cb.type = 'checkbox'
                        const span = document.createElement('span')
                        span.textContent = sel.toString() || 'Task item'
                        label.appendChild(cb)
                        label.appendChild(span)
                        range.deleteContents()
                        range.insertNode(label)
                      }} />

                      <div className="w-px h-5 bg-border mx-1 shrink-0" />

                      <ToolbarButton icon={Indent} tooltip="Indent" onClick={() => document.execCommand('indent')} />
                    </div>

                    {/* Single WYSIWYG editor — renders formatted content, fully editable */}
                    <ScrollArea className="flex-1">
                      <div
                        ref={textareaRef as React.RefObject<HTMLDivElement>}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setEditedContent(e.currentTarget.innerHTML)}
                        className="p-8 max-w-3xl min-h-[500px] outline-none focus:outline-none prose prose-sm dark:prose-invert max-w-none text-foreground prose-headings:text-foreground prose-headings:font-semibold prose-a:text-[oklch(0.648_0.2_131.684)] prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_hr]:border-border [&_hr]:my-4 [&_strong]:font-semibold [&_em]:italic [&_code]:font-mono [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto"
                        dangerouslySetInnerHTML={{
                          __html: (() => {
                            // Convert markdown to simple HTML for initial render
                            let html = editedContent
                              .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                              .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                              .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.+?)\*/g, '<em>$1</em>')
                              .replace(/`(.+?)`/g, '<code>$1</code>')
                              .replace(/^- \[ \] (.+)$/gm, '<label style="display:flex;align-items:center;gap:6px"><input type="checkbox"><span>$1</span></label>')
                              .replace(/^- (.+)$/gm, '<li>$1</li>')
                              .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
                              .replace(/^---$/gm, '<hr>')
                              .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
                              .replace(/\n\n/g, '</p><p>')
                            return `<p>${html}</p>`
                          })()
                        }}
                      />
                    </ScrollArea>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 bg-background">
                    <div className="p-8 max-w-3xl">
                      <MarkdownViewer content={selectedDoc.extracted_text} />
                    </div>
                  </ScrollArea>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <FileText className="size-8 opacity-30" />
                <p className="text-sm">Select a page from the tree to view its content.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Syncing state message */}
      {source.status === "SYNCING" && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
          <div className="flex items-center justify-center size-12 rounded-lg bg-amber-100">
            <RefreshCw className="size-6 text-amber-600 animate-spin" />
          </div>
          <p className="text-sm font-medium">Content is being synced...</p>
          <p className="text-xs max-w-xs text-center">
            Once the sync completes, the pages and content will be available for browsing and editing.
          </p>
        </div>
      )}

      {/* Integration source: flat table */}
      {source.type === "INTEGRATION" && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">File name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Size</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Updated</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {source.documents.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{doc.source_filename}</td>
                  <td className="px-4 py-3 text-muted-foreground uppercase text-xs">{doc.file_type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatBytes(doc.extracted_text_bytes)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatRelativeTime(doc.updated_at)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[oklch(0.648_0.2_131.684)]" />
                      <span className="capitalize text-muted-foreground">
                        {doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1.5 text-xs text-[oklch(0.648_0.2_131.684)] hover:underline">
                      <Eye className="size-3.5" />
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Helper components for the top toolbar
function ToolbarButton({ icon: Icon, onClick, tooltip }: { icon: any, onClick: () => void, tooltip: string }) {
  return (
    <button
      type="button"
      title={tooltip}
      onClick={onClick}
      className="flex items-center justify-center size-8 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
    >
      <Icon className="size-4" />
    </button>
  )
}

function ToolbarTextButton({ label, onClick, tooltip }: { label: string, onClick: () => void, tooltip: string }) {
  return (
    <button
      type="button"
      title={tooltip}
      onClick={onClick}
      className="flex items-center justify-center h-8 px-2.5 rounded hover:bg-muted text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
    >
      {label}
    </button>
  )
}
