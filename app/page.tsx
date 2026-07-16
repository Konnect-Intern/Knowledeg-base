"use client"

import { useState } from "react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { KnowledgeBaseDetail } from "@/components/kb/knowledge-base-detail"
import { KnowledgeBaseWithSidebar } from "@/components/kb/knowledge-base-with-sidebar"
import { KB_SOURCES } from "@/lib/kb-mock"

// 1. Simplified View State
type View =
  | { type: "knowledge-base-browse" }
  | { type: "knowledge-base-detail"; sourceId: number; category?: string; openEditMode?: boolean }
  | { type: "other"; section: string }

function PageContent() {
  // 2. Set the default view to your new Two-Pane layout!
  const [view, setView] = useState<View>({ type: "knowledge-base-browse" })
  const { setOpen } = useSidebar()

  const activeSection = view.type.startsWith("knowledge-base")
    ? "knowledge-base"
    : view.type === "other"
      ? view.section
      : "knowledge-base"

  function handleNavigate(section: string) {
    if (section === "knowledge-base") {
      setView({ type: "knowledge-base-browse" })
      setOpen(true)
    } else {
      setView({ type: "other", section })
    }
  }

  function handleSelectDocumentFromBrowser(sourceId: number, documentId: number) {
    const source = KB_SOURCES.find(s => s.id === sourceId)
    setView({
      type: "knowledge-base-detail",
      sourceId,
      category: source?.category,
      openEditMode: false
    })
    setOpen(false) // Optionally close the main sidebar to focus on reading
  }

  function handleBackToBrowse() {
    setView({ type: "knowledge-base-browse" })
    setOpen(true)
  }

  return (
    <>
      <AppSidebar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* 3. Ensure SidebarInset is flex-col, h-screen, and overflow-hidden for the panes to work */}
      <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">

        {/* Top bar */}
        <header className="flex h-12 items-center gap-2 border-b border-border px-4 shrink-0 bg-background z-10">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="h-4" />

          <div className="flex-1" />
          {/* Avatar */}
          <div className="flex size-7 items-center justify-center rounded-full bg-[oklch(0.648_0.2_131.684)] text-white text-xs font-semibold">
            G
          </div>
        </header>

        {/* 4. Removed the global p-6 padding so the Two-Pane goes edge-to-edge */}
        <main className="flex-1 min-h-0 overflow-hidden bg-background flex flex-col">

          {view.type === "knowledge-base-browse" && (
            <KnowledgeBaseWithSidebar
              sources={KB_SOURCES}
              onSelectDocument={handleSelectDocumentFromBrowser}
              // We pass undefined to onBack here so it doesn't show a breadcrumb back to the old categories page
              onBack={undefined}
            />
          )}

          {view.type === "knowledge-base-detail" && (
            <div className="h-full overflow-auto p-6">
              <KnowledgeBaseDetail
                sourceId={view.sourceId}
                category={view.category}
                onBack={handleBackToBrowse}
                onBackToCategories={handleBackToBrowse}
                openEditMode={view.openEditMode ?? false}
              />
            </div>
          )}

          {view.type === "other" && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-6">
              <p className="text-sm capitalize">{view.section.replace("-", " ")} — coming soon</p>
            </div>
          )}
        </main>
      </SidebarInset>
    </>
  )
}

export default function Page() {
  return (
    <SidebarProvider>
      <PageContent />
    </SidebarProvider>
  )
}