"use client"

import { useState, useEffect, useRef } from "react"
import {
  ChevronRight, Globe, Plug, FileText, Headphones, Pencil, Save,
  ExternalLink, Loader2, ChevronDown, Bold, Italic, Underline,
  Strikethrough, List, ListOrdered, Minus, Code, Undo, Redo, Indent,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { KB_SOURCES } from "@/lib/kb-mock"
import { formatRelativeTime, formatBytes } from "@/lib/kb-tree"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

function getDocTitle(externalId: string, sourceFilename: string | null): string {
  if (sourceFilename) return sourceFilename
  try {
    const url = new URL(externalId)
    const segs = url.pathname.split("/").filter(Boolean)
    if (!segs.length) return url.hostname
    return segs[segs.length - 1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  } catch { return externalId }
}

function SourceIcon({ type }: { type: string }) {
  const cls = "size-4"
  if (type === "WEBSITE") return <Globe className={cls} />
  if (type === "INTEGRATION") return <Plug className={cls} />
  if (type === "FILES") return <FileText className={cls} />
  if (type === "HELPDESK") return <Headphones className={cls} />
  return <Globe className={cls} />
}

function PropSection({ title, children, open: defaultOpen = true }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div className={cn("overflow-hidden transition-all duration-200", open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
        <div className="px-4 pb-4 space-y-3">{children}</div>
      </div>
    </div>
  )
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <div className="text-xs text-foreground">{children}</div>
    </div>
  )
}

function Tb({ icon: Icon, tooltip, onClick }: { icon: any; tooltip: string; onClick: () => void }) {
  return (
    <button type="button" title={tooltip} onClick={onClick}
      className="flex items-center justify-center size-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0">
      <Icon className="size-3.5" />
    </button>
  )
}

function TbText({ label, tooltip, onClick }: { label: string; tooltip: string; onClick: () => void }) {
  return (
    <button type="button" title={tooltip} onClick={onClick}
      className="flex items-center justify-center h-7 px-2 rounded hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0">
      {label}
    </button>
  )
}

interface DocumentPageProps {
  sourceId: number
  docId: number
  category: string
  onBack: () => void
  onBackToCategories: () => void
}

export function DocumentPage({ sourceId, docId, category, onBack, onBackToCategories }: DocumentPageProps) {
  const source = KB_SOURCES.find((s) => s.id === sourceId)
  const doc = source?.documents.find((d) => d.id === docId)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(doc?.extracted_text ?? "")
  const textareaRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (doc) setEditedContent(doc.extracted_text) }, [doc])

  if (!source || !doc) {
    return (
      <div className="flex items-center justify-center h-60 gap-2 text-muted-foreground">
        <Button variant="outline" size="sm" onClick={onBack}>Back</Button>
      </div>
    )
  }

  const docTitle = getDocTitle(doc.external_id, doc.source_filename)

  function handleSave(status?: "INDEXED" | "DRAFT") {
    const el = textareaRef.current
    doc!.extracted_text = el ? (el.innerHTML || editedContent) : editedContent
    doc!.updated_at = new Date().toISOString()
    if (status) {
      doc!.status = status
    }
    setIsEditing(false)
  }

  const viewerCls = "text-foreground text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-[oklch(0.648_0.2_131.684)] [&_a]:hover:underline [&_code]:bg-muted [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-3 [&_hr]:border-border [&_hr]:my-4"
  const isHtml = /^\s*</.test(doc.extracted_text)

  const statusCls: Record<string, string> = {
    INDEXED: "text-emerald-700 border-emerald-200 bg-emerald-50",
    SYNCING: "text-amber-700 border-amber-200 bg-amber-50",
    FAILED: "text-red-700 border-red-200 bg-red-50",
    DRAFT: "text-purple-700 border-purple-200 bg-purple-50",
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 shrink-0 gap-4">
        <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
          <button onClick={onBackToCategories} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">Knowledge Base</button>
          <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">{category}</button>
          <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 truncate max-w-[120px]">{source.name}</button>
          <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[180px]">{docTitle}</span>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditedContent(doc.extracted_text) }}>Cancel</Button>
              <Button variant="outline" size="sm" onClick={() => handleSave("DRAFT")} className="gap-1.5 text-[oklch(0.648_0.2_131.684)] border-[oklch(0.648_0.2_131.684)]/30 hover:border-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.648_0.2_131.684)]/10 transition-colors">
                <Save className="size-3.5" />Save as Draft
              </Button>
              <Button size="sm" onClick={() => handleSave("INDEXED")} className="bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white gap-1.5">
                <Save className="size-3.5" />Save
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5">
              <Pencil className="size-3.5" />Edit
            </Button>
          )}
        </div>
      </div>

      {doc.status === "SYNCING" && (
        <div className="mb-3 shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
          <Loader2 className="size-3.5 animate-spin shrink-0" />
          This document is currently being synced. Content may be incomplete.
        </div>
      )}

      {/* Main: content + properties */}
      <div className="flex flex-1 min-h-0 border-t border-border">

        {/* Content pane */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-border">
          {isEditing && (
            <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border bg-muted/40 overflow-x-auto shrink-0 flex-wrap">
              <Tb icon={Undo} tooltip="Undo" onClick={() => document.execCommand("undo")} />
              <Tb icon={Redo} tooltip="Redo" onClick={() => document.execCommand("redo")} />
              <span className="w-px h-4 bg-border mx-1 shrink-0" />
              <Tb icon={Bold} tooltip="Bold" onClick={() => document.execCommand("bold")} />
              <Tb icon={Italic} tooltip="Italic" onClick={() => document.execCommand("italic")} />
              <Tb icon={Underline} tooltip="Underline" onClick={() => document.execCommand("underline")} />
              <Tb icon={Strikethrough} tooltip="Strikethrough" onClick={() => document.execCommand("strikeThrough")} />
              <span className="w-px h-4 bg-border mx-1 shrink-0" />
              <TbText label="H1" tooltip="Heading 1" onClick={() => document.execCommand("formatBlock", false, "h1")} />
              <TbText label="H2" tooltip="Heading 2" onClick={() => document.execCommand("formatBlock", false, "h2")} />
              <TbText label="H3" tooltip="Heading 3" onClick={() => document.execCommand("formatBlock", false, "h3")} />
              <span className="w-px h-4 bg-border mx-1 shrink-0" />
              <Tb icon={List} tooltip="Bullet List" onClick={() => document.execCommand("insertUnorderedList")} />
              <Tb icon={ListOrdered} tooltip="Numbered List" onClick={() => document.execCommand("insertOrderedList")} />
              <Tb icon={Minus} tooltip="Divider" onClick={() => document.execCommand("insertHorizontalRule")} />
              <Tb icon={Code} tooltip="Inline Code" onClick={() => {
                const sel = window.getSelection()
                if (!sel?.rangeCount) return
                const range = sel.getRangeAt(0)
                const code = document.createElement("code")
                code.style.cssText = "font-family:monospace;background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px"
                range.surroundContents(code)
              }} />
              <Tb icon={Indent} tooltip="Indent" onClick={() => document.execCommand("indent")} />
            </div>
          )}
          <ScrollArea className="flex-1 bg-background">
            <div className="p-8 max-w-3xl">
              <h1 className="text-2xl font-bold text-foreground mb-2">{docTitle}</h1>
              <a href={doc.external_id} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[oklch(0.648_0.2_131.684)] hover:underline mb-6 w-fit transition-colors">
                {doc.external_id}<ExternalLink className="size-3" />
              </a>

              {isEditing ? (
                <div
                  ref={textareaRef as React.RefObject<HTMLDivElement>}
                  contentEditable suppressContentEditableWarning
                  onBlur={(e) => setEditedContent(e.currentTarget.innerHTML)}
                  className="min-h-[400px] outline-none text-sm leading-relaxed text-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_code]:font-mono [&_code]:bg-muted [&_code]:px-1.5 [&_code]:rounded"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      let h = editedContent
                        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
                        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.+?)\*/g, "<em>$1</em>")
                        .replace(/`(.+?)`/g, "<code>$1</code>")
                        .replace(/^- (.+)$/gm, "<li>$1</li>")
                        .replace(/^---$/gm, "<hr>")
                        .replace(/\n\n/g, "</p><p>")
                      return `<p>${h}</p>`
                    })(),
                  }}
                />
              ) : isHtml ? (
                <div className={viewerCls} dangerouslySetInnerHTML={{ __html: doc.extracted_text }} />
              ) : (
                <div className={viewerCls}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1>{children}</h1>,
                      h2: ({ children }) => <h2>{children}</h2>,
                      h3: ({ children }) => <h3>{children}</h3>,
                      p: ({ children }) => <p>{children}</p>,
                      ul: ({ children }) => <ul>{children}</ul>,
                      ol: ({ children }) => <ol>{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong>{children}</strong>,
                      em: ({ children }) => <em>{children}</em>,
                      hr: () => <hr />,
                      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                      a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
                      code: ({ children, inline }: any) => inline
                        ? <code>{children}</code>
                        : <pre><code className="font-mono text-sm">{children}</code></pre>,
                    }}
                  >{doc.extracted_text}</ReactMarkdown>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Properties sidebar */}
        <aside className="w-64 shrink-0 flex flex-col overflow-hidden bg-muted/10">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Properties</p>
          </div>
          <ScrollArea className="flex-1">
            <PropSection title="Document Info">
              <PropRow label="Status">
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", statusCls[doc.status] ?? "")}>
                  {doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
                </Badge>
              </PropRow>
              <PropRow label="File Type">
                <span className="uppercase">{doc.file_type.replace("_", " ")}</span>
              </PropRow>
              <PropRow label="Last Synced">
                {formatRelativeTime(doc.updated_at)}
              </PropRow>
              <PropRow label="Created">
                {formatRelativeTime(doc.created_at)}
              </PropRow>
              <PropRow label="Content Size">
                {formatBytes(doc.content_bytes)}
              </PropRow>
              <PropRow label="Extracted Text">
                {formatBytes(doc.extracted_text_bytes)}
              </PropRow>
              <PropRow label="Chunks">
                <span>{doc.parent_chunk_count} parent · {doc.child_chunk_count} child</span>
              </PropRow>
              <PropRow label="Embed Tokens">
                {doc.embed_token_count.toLocaleString()}
              </PropRow>
            </PropSection>

            <PropSection title="Source">
              <PropRow label="Name">
                <div className="flex items-center gap-1.5">
                  <SourceIcon type={source.type} />
                  <span className="truncate">{source.name}</span>
                </div>
              </PropRow>
              <PropRow label="URL">
                <a href={source.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[oklch(0.648_0.2_131.684)] hover:underline break-all">
                  {source.url}<ExternalLink className="size-2.5 shrink-0" />
                </a>
              </PropRow>
              <PropRow label="Category">{category}</PropRow>
              <PropRow label="Type">
                <span className="capitalize">{source.type.charAt(0) + source.type.slice(1).toLowerCase()}</span>
              </PropRow>
              <PropRow label="Total Docs">
                {source.documents.length} document{source.documents.length !== 1 ? "s" : ""}
              </PropRow>
            </PropSection>
          </ScrollArea>
        </aside>
      </div>
    </div>
  )
}
