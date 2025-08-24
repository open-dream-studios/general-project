"use client";
import { createContext, ReactNode, useEffect, useState } from "react";
import { makeRequest } from "../util/axios";
import { ThemeType } from "../util/appTheme";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useModal1Store, useModal2Store } from "@/store/useModalStore";
import { useLeftBarOpenStore } from "@/store/useLeftBarOpenStore";
import { logout } from "@/util/auth";
import axios from "axios";

export interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_img_src: string | null;
  theme: ThemeType;
  credits: string;
  auth_provider: string;
  created_at: string;
}

interface AuthContextType {
  currentUser: User | null;
  handleLogout: () => void;
  isLoadingCurrentUserData: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  handleLogout: () => {},
  isLoadingCurrentUserData: false,
});

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);
  const setLeftBarOpen = useLeftBarOpenStore(
    (state: any) => state.setLeftBarOpen
  );

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const storedUser = localStorage.getItem("user");
  //     if (
  //       storedUser &&
  //       storedUser !== "undefined" &&
  //       storedUser !== "null" &&
  //       JSON.parse(storedUser).id
  //     ) {
  //       queryClient.setQueryData(["currentUser"], JSON.parse(storedUser));
  //     }
  //   }
  // }, [queryClient]);

  const { data: currentUserData, isLoading: isLoadingCurrentUserData } =
    useQuery<User | null>({
      queryKey: ["currentUser"],
      queryFn: async () => {
        const res = await makeRequest.get("/api/users/current");
        // const res = axios.get("https://general-project-rust.vercel.app/api/users/current")
        return res.data;
        // console.log(res)
        // return null
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 5,
      refetchOnMount: true,
    });
  const currentUser = currentUserData ?? null;

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    }
    queryClient.clear();
    setModal1({
      ...modal1,
      open: false,
    });
    setModal2({
      ...modal2,
      open: false,
    });
    setLeftBarOpen(false);
    const success = await logout();
    if (success) {
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        handleLogout,
        isLoadingCurrentUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
