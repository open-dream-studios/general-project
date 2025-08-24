"use client";
import { AuthContext } from "@/contexts/authContext";
import Modal2Continue from "@/modals/Modal2Continue";
import { useModal2Store } from "@/store/useModalStore";
import { appTheme, ThemeType } from "@/util/appTheme";
import { makeRequest } from "@/util/axios";
import { capitalizeFirstLetter } from "@/util/functions/Data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import { useContext } from "react";
import { IoMoonOutline } from "react-icons/io5";
import { LuSun } from "react-icons/lu";

const Account = () => {
  const { currentUser, handleLogout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);

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

  const handleSignOut = () => {
    if (!currentUser) return null;
    setModal2({
      ...modal2,
      open: !modal2.open,
      showClose: false,
      offClickClose: true,
      width: "w-[300px]",
      maxWidth: "max-w-[400px]",
      aspectRatio: "aspect-[5/2]",
      borderRadius: "rounded-[12px] md:rounded-[15px]",
      content: (
        <Modal2Continue
          text={
            "Sign out as " +
            currentUser.first_name +
            " " +
            currentUser.last_name +
            "?"
          }
          onContinue={handleLogout}
          threeOptions={false}
        />
      ),
    });
  };

  if (!currentUser) return null;

  return (
    <div className="relative ml-[5px] md:ml-[8px] h-full flex flex-col pt-[50px] w-[calc(100%-43px)] sm:w-[calc(100%-80px)]">
      <div className="ml-[1px] w-[90%] flex flex-col items-center justify-center">
        <p className="font-[600] lg:mb-[21px] mb-[19px] text-[29px] leading-[29px] md:text-[32px] md:leading-[32px] w-[100%] items-start">
          {currentUser.first_name} {currentUser.last_name}
        </p>
      </div>

      <div
        style={{
          border: `1px solid ${appTheme[currentUser.theme].table_bg_2}`,
          backgroundColor: appTheme[currentUser.theme].background_2,
        }}
        className="flex flex-row items-center gap-[10px] py-[9px] rounded-[10px] px-[14px]"
      >
        <div className="aspect-[1/1] h-[100%] flex items-center justify-center">
          {currentUser.profile_img_src !== null ? (
            <img
              className="w-[28px] h-[28px] rounded-full"
              src={currentUser.profile_img_src}
            />
          ) : (
            <div
              className="w-full h-full relative overflow-hidden rounded-full flex items-center justify-center"
              style={{
                backgroundColor: appTheme[currentUser.theme].background_4,
              }}
            >
              <div className="bg-white w-[12px] h-[12px] absolute top-[7px] rounded-full"></div>
              <div
                className="bg-white w-[18px] h-[12px] absolute top-[21px]"
                style={{
                  borderRadius: "20px",
                }}
              ></div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <p
            className="font-[400] text-[17px] opacity-[0.7]"
            style={{ color: appTheme[currentUser.theme].text_3 }}
          >
            {currentUser.email}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-[15px] absolute bottom-[32px] sm:flex sm:mt-[18px] w-[100%]">
        <div
          onClick={handleSignOut}
          className="dim select-none cursor-pointer w-[100%] sm:w-[50%] hover:brightness-75 h-[40px] flex items-center justify-center font-[600]"
          style={{
            borderRadius: "6px",
            backgroundColor: appTheme[currentUser.theme].background_2,
            color: appTheme[currentUser.theme].text_2,
          }}
        >
          Sign out
        </div>

        <div
          onClick={handleThemeChange}
          className="cursor-pointer w-[100%] sm:w-[50%] h-[40px] rounded-[10px] group transition-colors duration-500"
        >
          <div
            className="gap-[12px] w-full h-full group-hover:border-0 group-hover:bg-[var(--hover-bg)] rounded-[10px] flex justify-center items-center px-[15px] truncate font-[500] text-[16px]"
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
              {capitalizeFirstLetter(
                currentUser.theme === "dark" ? "light" : "dark"
              )}{" "}
              Mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
