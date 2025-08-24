import { RefObject } from "react";
import { create } from "zustand";

export const useLeftBarOpenStore = create((set) => ({
  leftBarOpen: false,
  setLeftBarOpen: (newLeftBarOpen: boolean) =>
    set({ leftBarOpen: newLeftBarOpen }),
}));


export interface LeftBarRefStore {
  leftBarRef: RefObject<HTMLDivElement> | null;
  setLeftBarRef: (ref: RefObject<HTMLDivElement>) => void;
}

export const useLeftBarRefStore = create<LeftBarRefStore>((set) => ({
  leftBarRef: null,
  setLeftBarRef: (ref) => set({ leftBarRef: ref }),
}));