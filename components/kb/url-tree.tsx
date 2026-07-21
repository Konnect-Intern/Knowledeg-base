"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TreeNode } from "@/lib/kb-tree"
import { isFolder } from "@/lib/kb-tree"

interface UrlTreeProps {
  node: TreeNode
  selectedDocId: number | null
  onSelectNode: (node: TreeNode) => void
  /** depth=0 is the root; each recursive call increments by 1 */
  depth?: number
  /** root is always shown expanded; children start expanded up to depth 1 */
  defaultExpanded?: boolean
  /** compact mode for sidebar display - reduces padding and font size */
  compact?: boolean
}

export function UrlTree({
  node,
  selectedDocId,
  onSelectNode,
  depth = 0,
  defaultExpanded = true,
  compact = false,
}: UrlTreeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const folder = isFolder(node)
  const isRoot = depth === 0
  const isSelected = node.document !== null && node.document.id === selectedDocId

  // Root node: render directly as the tree wrapper (no row for root itself, just children)
  if (isRoot) {
    return (
      <div className="select-none">
        {!compact && (
          <>
            {/* Root label row (only show in full mode) */}
            <button
              className={cn(
                "group flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-muted/60",
                isSelected && "bg-[oklch(0.96_0.04_131.684)] text-[oklch(0.3_0.1_131.684)]"
              )}
              onClick={() => {
                if (folder) setExpanded((v) => !v)
                if (node.document) onSelectNode(node)
              }}
            >
              <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                {folder ? (
                  expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />
                ) : null}
              </span>
              {folder ? (
                expanded ? (
                  <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Folder className="size-4 shrink-0 text-muted-foreground" />
                )
              ) : (
                <FileText className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate flex-1" title={node.label}>
                {node.label}
              </span>
              {/* green dot */}
              <span className="ml-auto size-2 shrink-0 rounded-full bg-[oklch(0.648_0.2_131.684)]" />
            </button>
          </>
        )}

        {/* Children */}
        {folder && expanded && (
          <div>
            {node.children.map((child) => (
              <UrlTree
                key={child.path}
                node={child}
                selectedDocId={selectedDocId}
                onSelectNode={onSelectNode}
                depth={depth + 1}
                defaultExpanded={depth < 1}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Non-root nodes: indented rows
  // Each depth level adds 16px of left padding via inline style to avoid Tailwind purge issues
  // with dynamic values. We cap the visual indent at 6 levels to prevent overflow; deeper
  // routes continue to work but indent stops growing to preserve the panel width.
  const indentPx = Math.min(depth, 6) * (compact ? 12 : 16)

  return (
    <div>
      <button
        className={cn(
          compact
            ? "group flex w-full items-center gap-1 rounded px-1 py-1 text-left text-xs transition-colors hover:bg-muted/60"
            : "group flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60",
          isSelected && "bg-[oklch(0.96_0.04_131.684)] text-[oklch(0.3_0.1_131.684)]"
        )}
        style={{ paddingLeft: `${indentPx + 8}px` }}
        onClick={() => {
          if (folder) setExpanded((v) => !v)
          if (node.document) onSelectNode(node)
        }}
      >
        {/* Chevron for folders, spacer for leaves */}
        <span className="flex size-3 shrink-0 items-center justify-center text-muted-foreground">
          {folder ? (
            expanded ? (
              <ChevronDown className={cn(compact ? "size-3" : "size-3.5")} />
            ) : (
              <ChevronRight className={cn(compact ? "size-3" : "size-3.5")} />
            )
          ) : null}
        </span>

        {/* Icon: folder or file — same color */}
        {folder ? (
          expanded ? (
            <FolderOpen className={cn("shrink-0 text-muted-foreground", compact ? "size-3" : "size-4")} />
          ) : (
            <Folder className={cn("shrink-0 text-muted-foreground", compact ? "size-3" : "size-4")} />
          )
        ) : (
          <FileText className={cn("shrink-0 text-muted-foreground", compact ? "size-3" : "size-4")} />
        )}

        {/* Label — truncated so it never overflows the panel */}
        <span
          className="truncate flex-1 min-w-0"
          title={node.label}
        >
          {node.label}
        </span>

        {/* Green status dot — always shown */}
        <span className={cn("shrink-0 rounded-full bg-[oklch(0.648_0.2_131.684)]", compact ? "size-1.5 ml-1" : "ml-2 size-2")} />
      </button>

      {/* Render children when expanded */}
      {folder && expanded && (
        <div>
          {node.children.map((child) => (
            <UrlTree
              key={child.path}
              node={child}
              selectedDocId={selectedDocId}
              onSelectNode={onSelectNode}
              depth={depth + 1}
              defaultExpanded={depth < 1}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  )
}
