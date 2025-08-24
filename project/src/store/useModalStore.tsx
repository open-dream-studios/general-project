import { ReactNode } from "react";
import { create } from "zustand";

export type ModalType = {
  open: boolean;
  showClose: boolean;
  offClickClose: boolean;
  width: string;
  maxWidth: string;
  aspectRatio: string;
  borderRadius: string;
  content: ReactNode;
};

export const useModal1Store = create((set) => ({
  modal1: {
    open: false,
    showClose: true,
    offClickClose: true,
    width: "w-[100vw] sm:w-[90vw] display-height sm:h-[auto]",
    maxWidth: "max-w-[1000px] min-h-[655px] sm:min-h-[500px]",
    aspectRatio: "sm:aspect-[3/3.4] md:aspect-[5/4.5] lg:aspect-[5/3.9]",
    borderRadius: "rounded-0 sm:rounded-[15px] md:rounded-[20px]",
    content: <></>,
  },
  setModal1: (newModal1: ModalType) => set({ modal1: newModal1 }),
}));

export const useModal2Store = create((set) => ({
  modal2: {
    open: false,
    showClose: false,
    offClickClose: false,
    width: "w-[300px]",
    maxWidth: "max-w-[400px]",
    aspectRatio: "aspect-[5/2]",
    borderRadius: "rounded-[12px] md:rounded-[15px]",
    content: <></>,
  },
  setModal2: (newModal2: ModalType) => set({ modal2: newModal2 }),
}));
