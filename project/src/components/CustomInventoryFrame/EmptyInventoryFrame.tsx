"use client";
import { AuthContext } from "@/contexts/authContext";
import { appTheme } from "@/util/appTheme";
import { FRONTEND_URL } from "@/util/config";
import Link from "next/link";
import { useContext } from "react";
import { FaPlus } from "react-icons/fa6";

const EmptyInventoryFrame = () => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) return null;
  return (
    <div
      className="group cursor-pointer dim hover:brightness-75 rounded-[5px] overflow-hidden relative w-[100%] h-[100%] flex flex-col"
      style={{
        backgroundColor: appTheme[currentUser.theme].background_2,
      }}
    >
      <Link
        href={`${FRONTEND_URL}`}
        className="w-[100%] h-[100%]"
      >
        <div
          style={{
            backgroundColor: appTheme[currentUser.theme].background_3,
          }}
          className="flex justify-center items-end relative w-[100%] aspect-[16/9] overflow-hidden"
        >
          <div
            className="mb-[33px] brightness-75 flex flex-col items-center font-[300] gap-[2px]"
            style={{
              color: appTheme[currentUser.theme].text_3,
            }}
          >
            <FaPlus className="w-[29px] h-[29px]" />
            <p className="">Add new product</p>
          </div>
        </div>
        <div className="w-[100%] relative flex flex-col pt-[5px] mb-[3px] px-[13px] gap-[6px]">
          <div
            style={{
              backgroundColor: appTheme[currentUser.theme].background_3,
            }}
            className="mt-[2px] w-[160px] h-[22px] rounded-[10px]"
          ></div>
        </div>

        <div className="mx-[9px] py-[1px] pr-[6px] pl-[4px] mb-[7px] w-fit flex flex-row gap-[8px] items-center">
          <div
            style={{
              backgroundColor: appTheme[currentUser.theme].background_3,
            }}
            className="w-[26px] h-[26px] min-w-[27px] overflow-hidden rounded-full"
          ></div>
        </div>
      </Link>
    </div>
  );
};

export default EmptyInventoryFrame;
