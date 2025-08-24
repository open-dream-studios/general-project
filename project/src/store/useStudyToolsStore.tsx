import { RefObject } from "react";
import { create } from "zustand";

export interface GPTRefStore {
  GPTRef: RefObject<HTMLTextAreaElement> | null;
  setGPTRef: (ref: RefObject<HTMLTextAreaElement>) => void;
}

export const useGPTRefStore = create<GPTRefStore>((set) => ({
  GPTRef: null,
  setGPTRef: (ref) => set({ GPTRef: ref }),
}));


export interface NoteRefStore {
  noteRef: RefObject<HTMLDivElement> | null;
  setNoteRef: (ref: RefObject<HTMLDivElement>) => void;
}

export const useNoteRefStore = create<NoteRefStore>((set) => ({
  noteRef: null,
  setNoteRef: (ref) => set({ noteRef: ref }),
}));