import type { KbDocument } from "./kb-mock"

export interface TreeNode {
  /** URL segment label, e.g. "connected-apps" or "ac-connect" */
  label: string
  /** Full URL path for this node, e.g. "/connected-apps/ac-connect" */
  path: string
  /** The document attached to this exact node (null for pure intermediate folders) */
  document: KbDocument | null
  /** Child nodes, sorted alphabetically */
  children: TreeNode[]
}

/**
 * Builds a tree from a flat list of KbDocuments by parsing the URL pathname of each
 * external_id. Intermediate segments that have no direct document become virtual folder
 * nodes with `document: null`.
 *
 * Example external_ids:
 *   https://cliniko.com/reviews/
 *   https://cliniko.com/connected-apps/ac-connect
 *   https://cliniko.com/faq/what-is-practice-management-software/
 *
 * Resulting tree (rooted at hostname):
 *   cliniko.com
 *   ├── reviews           ← doc 12946
 *   ├── connected-apps    ← folder (no direct doc)
 *   │   └── ac-connect    ← doc 12975
 *   ├── charity           ← doc 12950
 *   ├── faq               ← folder (no direct doc)
 *   │   └── what-is-...   ← doc 12951
 *   └── pricing           ← doc 12935
 */
export function buildUrlTree(documents: KbDocument[]): TreeNode {
  // Determine the shared hostname from the first document
  let hostname = "root"
  if (documents.length > 0) {
    try {
      hostname = new URL(documents[0].external_id).hostname
    } catch {
      hostname = "root"
    }
  }

  // Internal map type: label → { document, children map }
  interface InternalNode {
    document: KbDocument | null
    children: Map<string, InternalNode>
  }

  const root: InternalNode = { document: null, children: new Map() }

  for (const doc of documents) {
    let segments: string[] = []
    try {
      const url = new URL(doc.external_id)
      // Split pathname into non-empty segments, strip trailing empty from trailing slash
      segments = url.pathname.split("/").filter(Boolean)
    } catch {
      segments = [doc.external_id]
    }

    // Walk/create nodes for each segment
    let current = root
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      if (!current.children.has(seg)) {
        current.children.set(seg, { document: null, children: new Map() })
      }
      current = current.children.get(seg)!
    }

    // Attach doc to the deepest node (leaf for this URL)
    current.document = doc
  }

  // Convert the internal map structure to the exported TreeNode shape
  function toTreeNode(label: string, path: string, node: InternalNode): TreeNode {
    const children = Array.from(node.children.entries())
      .map(([childLabel, childNode]) =>
        toTreeNode(childLabel, `${path}/${childLabel}`, childNode)
      )
      .sort((a, b) => a.label.localeCompare(b.label))

    return { label, path, document: node.document, children }
  }

  const rootChildren = Array.from(root.children.entries())
    .map(([label, node]) => toTreeNode(label, `/${label}`, node))
    .sort((a, b) => a.label.localeCompare(b.label))

  return {
    label: hostname,
    path: "/",
    document: root.document,
    children: rootChildren,
  }
}

/** Returns true if this node is a folder (has children), regardless of whether it also has a doc */
export function isFolder(node: TreeNode): boolean {
  return node.children.length > 0
}

/** Returns true if this node is a leaf (no children) */
export function isLeaf(node: TreeNode): boolean {
  return node.children.length === 0
}

/** Flatten all tree nodes with documents for quick lookup */
export function flattenTree(node: TreeNode): TreeNode[] {
  const result: TreeNode[] = []
  if (node.document) result.push(node)
  for (const child of node.children) {
    result.push(...flattenTree(child))
  }
  return result
}

/** Format bytes to human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Format a date string as relative time */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "1d ago"
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return "1mo ago"
  return `${diffMonths}mo ago`
}

/** Extracts a readable title from a document */
export function getDocTitle(externalId: string, sourceFilename: string | null): string {
  if (sourceFilename) return sourceFilename
  try {
    const url = new URL(externalId)
    const segs = url.pathname.split("/").filter(Boolean)
    if (!segs.length) return url.hostname
    return segs[segs.length - 1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  } catch { return externalId }
}
