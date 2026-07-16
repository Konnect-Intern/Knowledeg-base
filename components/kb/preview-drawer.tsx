"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Copy, Check } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { usePreviewStore } from "@/lib/preview-store"
import { formatBytes, formatRelativeTime } from "@/lib/kb-tree"
import { cn } from "@/lib/utils"

export function PreviewDrawer() {
  const { open, document: doc, closePreview } = usePreviewStore()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!doc) return
    await navigator.clipboard.writeText(doc.extracted_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const title = doc?.source_filename ?? doc?.external_id?.split("/").filter(Boolean).pop() ?? "Document"

  return (
    <Sheet open={open} onOpenChange={(v) => !v && closePreview()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
          <SheetTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="truncate">{title}</span>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px] font-medium",
                doc?.status === "INDEXED" &&
                  "bg-[oklch(0.96_0.04_131.684)] text-[oklch(0.3_0.1_131.684)] border-[oklch(0.85_0.08_131.684)]"
              )}
            >
              <span className="mr-1 size-1.5 rounded-full bg-[oklch(0.648_0.2_131.684)] inline-block" />
              {doc?.status?.charAt(0) ?? ""}{doc?.status?.slice(1).toLowerCase() ?? ""}
            </Badge>
          </SheetTitle>
          {doc?.external_id && (
            <a
              href={doc.external_id}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[oklch(0.648_0.2_131.684)] hover:underline w-fit mt-0.5"
            >
              {doc.external_id}
              <ExternalLink className="size-3" />
            </a>
          )}
        </SheetHeader>

        {/* Metadata strip */}
        {doc && (
          <div className="flex items-center gap-6 px-5 py-3 border-b border-border bg-muted/30 shrink-0 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">File type</span>{" "}
              {doc.file_type.replace("_", "/")}
            </span>
            <span>
              <span className="font-medium text-foreground">Extracted</span>{" "}
              {formatBytes(doc.extracted_text_bytes)}
            </span>
            <span>
              <span className="font-medium text-foreground">Updated</span>{" "}
              {formatRelativeTime(doc.updated_at)}
            </span>
            <span>
              <span className="font-medium text-foreground">Tokens</span>{" "}
              {doc.embed_token_count.toLocaleString()}
            </span>
          </div>
        )}

        {/* Markdown body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-5 py-5">
            {doc?.extracted_text ? (
              <div className="prose prose-sm prose-neutral max-w-none
                prose-headings:font-semibold prose-headings:text-foreground
                prose-p:text-foreground prose-p:leading-relaxed
                prose-a:text-[oklch(0.648_0.2_131.684)] prose-a:no-underline hover:prose-a:underline
                prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-blockquote:border-l-[oklch(0.648_0.2_131.684)] prose-blockquote:text-muted-foreground
                prose-strong:text-foreground
                prose-table:text-sm
                prose-th:text-foreground
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {doc.extracted_text}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No extracted content available.</p>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-5 py-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-3.5 text-[oklch(0.648_0.2_131.684)]" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy content"}
          </Button>
          {doc?.external_id && (
            <Button
              size="sm"
              className="gap-1.5 bg-[oklch(0.648_0.2_131.684)] hover:bg-[oklch(0.58_0.2_131.684)] text-white"
              asChild
            >
              <a href={doc.external_id} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" />
                Open source URL
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
