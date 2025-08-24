"use client";
import { AuthContext } from "@/contexts/authContext";
import { appTheme, ThemeType } from "@/util/appTheme";
import { makeRequest } from "@/util/axios";
import { capitalizeFirstLetter } from "@/util/functions/Data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import { useContext } from "react";
import { IoMoonOutline } from "react-icons/io5";
import { LuSun } from "react-icons/lu";

const UserSettings = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const toggleThemeMutation = useMutation<
    void,
    Error,
    ThemeType,
    { previousUser: User | null }
  >({
    mutationFn: async (newTheme) => {
      await makeRequest.put("/api/users/update-current", { theme: newTheme });
    },
    onMutate: (newTheme) => {
      queryClient.cancelQueries({ queryKey: ["currentUser"] });
      const previousUser =
        queryClient.getQueryData<User | null>(["currentUser"]) ?? null;

      // Optimistically update UI
      queryClient.setQueryData(["currentUser"], (oldData: User | null) =>
        oldData ? { ...oldData, theme: newTheme } : oldData
      );
      return { previousUser };
    },
    onError: (_, __, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["currentUser"], context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const handleThemeChange = () => {
    if (!currentUser) return null;
    const newTheme = currentUser.theme === "light" ? "dark" : "light";
    toggleThemeMutation.mutate(newTheme);
  };

  if (!currentUser) return null;

  return (
    <div className="ml-[5px] md:ml-[8px] w-full h-full flex flex-col pt-[50px]">
      <div className="ml-[1px] w-[90%] flex flex-col items-center justify-center">
        <p className="font-[600] lg:mb-[21px] mb-[19px] text-[29px] leading-[29px] md:text-[32px] md:leading-[32px] w-[100%] items-start">
          Settings
        </p>
      </div>

      <div
        onClick={handleThemeChange}
        className="cursor-pointer w-[160px] h-[40px] rounded-[10px] transition-colors duration-500 group"
      >
        <div
          className="gap-[12px] w-full h-full group-hover:border-0 group-hover:bg-[var(--hover-bg)] rounded-[10px] flex justify-left items-center px-[15px] truncate font-[500] text-[16px]"
          style={
            {
              border: "0.5px solid " + appTheme[currentUser.theme].text_4,
              transition: "background-color 0.2s ease-in-out",
              "--hover-bg": appTheme[currentUser.theme].background_2,
            } as React.CSSProperties
          }
        >
          {currentUser.theme === "dark" ? (
            <LuSun
              size={20}
              title="Light Mode"
              className=""
              color={appTheme[currentUser.theme].text_3}
            />
          ) : (
            <IoMoonOutline
              size={20}
              title="Dark Mode"
              className=""
              color={appTheme[currentUser.theme].text_3}
            />
          )}
          <p
            style={{
              color: appTheme[currentUser.theme].text_2,
            }}
          >
            {capitalizeFirstLetter(currentUser.theme === "dark" ? "light" : "dark")} Mode
          </p>
        </div>
      </div>

      {/* <div
        className="dim cursor-pointer hover:brightness-75"
        onClick={handleThemeChange}
      >
        {currentUser.theme === "dark" ? (
          <LuSun
            size={23}
            title="Light Mode"
            className=""
            color={appTheme[currentUser.theme].text_1}
          />
        ) : (
          <IoMoonOutline
            size={23}
            title="Dark Mode"
            className=""
            color={appTheme[currentUser.theme].text_1}
          />
        )}
      </div> */}
    </div>
  );
};

export default UserSettings;
