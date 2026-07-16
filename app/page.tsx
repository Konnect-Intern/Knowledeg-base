"use client"

import { useState, useEffect } from "react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { KnowledgeBaseList } from "@/components/kb/knowledge-base-list"
import { KnowledgeBaseDetail } from "@/components/kb/knowledge-base-detail"
import { CategoryList } from "@/components/kb/category-list"

type View =
  | { type: "knowledge-base-categories" }
  | { type: "knowledge-base-list"; category?: string }
  | { type: "knowledge-base-detail"; sourceId: number; category?: string; openEditMode?: boolean }
  | { type: "other"; section: string }

function PageContent() {
  const [view, setView] = useState<View>({ type: "knowledge-base-categories" })
  const { setOpen } = useSidebar()

  const activeSection =
    view.type === "knowledge-base-categories" ||
    view.type === "knowledge-base-list" ||
    view.type === "knowledge-base-detail"
      ? "knowledge-base"
      : view.type === "other"
      ? view.section
      : "knowledge-base"

  function handleNavigate(section: string) {
    if (section === "knowledge-base") {
      setView({ type: "knowledge-base-categories" })
      setOpen(true)
    } else {
      setView({ type: "other", section })
    }
  }

  function handleSelectCategory(category: string) {
    setView({ type: "knowledge-base-list", category })
    setOpen(true)
  }

  function handleBackToCategories() {
    setView({ type: "knowledge-base-categories" })
    setOpen(true)
  }

  function handleSelectSource(id: number) {
    const currentCategory = view.type === "knowledge-base-list" ? view.category : undefined
    setView({ type: "knowledge-base-detail", sourceId: id, category: currentCategory, openEditMode: false })
    setOpen(false)
  }

  function handleEditSource(id: number) {
    const currentCategory = view.type === "knowledge-base-list" ? view.category : undefined
    setView({ type: "knowledge-base-detail", sourceId: id, category: currentCategory, openEditMode: true })
    setOpen(false)
  }

  function handleBackToList() {
    // Go back to the KB list with the same category filter if it exists
    const currentCategory = view.type === "knowledge-base-detail" ? view.category : undefined
    setView({ type: "knowledge-base-list", category: currentCategory })
    setOpen(true)
  }

  return (
    <>
      <AppSidebar activeSection={activeSection} onNavigate={handleNavigate} />
      <SidebarInset className="bg-background">
        {/* Top bar */}
        <header className="flex h-12 items-center gap-2 border-b border-border px-4 shrink-0">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex-1" />
          {/* Avatar */}
          <div className="flex size-7 items-center justify-center rounded-full bg-[oklch(0.648_0.2_131.684)] text-white text-xs font-semibold">
            G
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {view.type === "knowledge-base-categories" && (
            <CategoryList
              onSelectCategory={handleSelectCategory}
              onSelectSource={handleSelectSource}
              onBack={() => handleNavigate("home")}
              onSourceAdded={(source) => {
                setView({ type: "knowledge-base-list", category: source.category })
                setOpen(true)
              }}
            />
          )}
          {view.type === "knowledge-base-list" && (
            <KnowledgeBaseList
              onSelectSource={handleSelectSource}
              onEditSource={handleEditSource}
              category={view.category}
              onBack={view.category ? handleBackToCategories : undefined}
              onAddSource={() => { /* stay on list, new source card shown with Syncing badge */ }}
            />
          )}
          {view.type === "knowledge-base-detail" && (
            <div className="h-full flex flex-col">
              <KnowledgeBaseDetail
                sourceId={view.sourceId}
                category={view.category}
                onBack={handleBackToList}
                onBackToCategories={handleBackToCategories}
                openEditMode={view.openEditMode ?? false}
              />
            </div>
          )}
          {view.type === "other" && (
            <div className="flex flex-col items-center justify-center h-60 gap-2 text-muted-foreground">
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
