import { RefObject } from "react";
import { create } from "zustand";

export interface PageLayoutRefStore {
  pageLayoutRef: RefObject<HTMLDivElement> | null;
  setPageLayoutRef: (ref: RefObject<HTMLDivElement>) => void;
}

export const usePageLayoutRefStore = create<PageLayoutRefStore>((set) => ({
  pageLayoutRef: null,
  setPageLayoutRef: (ref) => set({ pageLayoutRef: ref }),
}));
