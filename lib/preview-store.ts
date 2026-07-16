import { create } from "zustand"
import type { KbDocument } from "./kb-mock"

interface PreviewState {
  open: boolean
  document: KbDocument | null
  openPreview: (doc: KbDocument) => void
  closePreview: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  open: false,
  document: null,
  openPreview: (doc) => set({ open: true, document: doc }),
  closePreview: () => set({ open: false }),
}))
