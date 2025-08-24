"use client";
import React, { useContext, useState } from "react";
import { appTheme } from "../../util/appTheme";
import { AuthContext } from "../../contexts/authContext";
import Account from "./Account";
import UserSettings from "./UserSettings";

type SettingsProps = {
  initialPage: SettingsPages | null;
};

type SettingsPages = "Account";

const Settings = ({ initialPage }: SettingsProps) => {
  const { currentUser } = useContext(AuthContext);
  const [selectedPage, setSelectedPage] = useState<SettingsPages>(
    initialPage === null ? "Account" : initialPage
  );
  const settingsPages: SettingsPages[] = ["Account"];

  if (!currentUser) return null;

  return (
    <div className="w-full h-full flex flex-row">
      <div className="hidden sm:block pl-[30px] select-none w-[25%] min-w-[200px] h-full py-[30px]">
        <div
          className="font-[600] text-[25px] leading-[18px] h-[35px]"
          style={{ color: appTheme[currentUser.theme].text_1 }}
        >
          Settings
        </div>
        <div className="mt-[1px] flex-1 h-[calc(100%-35px)] pr-[30px] flex flex-col gap-[7px]">
          {settingsPages.map((item: string, index: number) => {
            const isSelected = selectedPage === settingsPages[index];
            return (
              <div
                key={index}
                onClick={() => setSelectedPage(settingsPages[index])}
                className="cursor-pointer w-full h-[40px] rounded-[10px]"
                // transition-colors duration-500 group
                style={{
                  backgroundColor: appTheme[currentUser.theme].background_2_2,
                  // backgroundColor: isSelected
                  //   ? appTheme[currentUser.theme].background_2_2
                  //   : appTheme[currentUser.theme].background_1_2,
                }}
              >
                <div
                  className="w-full h-full group-hover:bg-[var(--hover-bg)] rounded-[10px] flex justify-left items-center px-[15px] truncate font-[500] text-[16px]"
                  style={
                    {
                      transition: "background-color 0.2s ease-in-out",
                      "--hover-bg": appTheme[currentUser.theme].background_2_2,
                    } as React.CSSProperties
                  }
                >
                  {settingsPages[index]}
                </div>
              </div>
            );
          })}
        </div>

        {/* <div
          // onClick={handleSignOut}
          className="dim select-none cursor-pointer m-[-10px] w-[calc(25%-10px)] hover:brightness-75 h-[40px] absolute bottom-[29px] flex items-center justify-center font-[600]"
          style={{
            borderRadius: "6px",
            backgroundColor: appTheme[currentUser.theme].background_2,
            color: appTheme[currentUser.theme].text_2,
          }}
        >
          Sign out
        </div> */}
      </div>
      <div className="w-[100%] sm:w-[75%] pl-[30px] sm:pl-0 h-full sm:max-w-[calc(100%-200px)]">
        {selectedPage === "Account" && <Account />}
      </div>
    </div>
  );
};

export default Settings;
