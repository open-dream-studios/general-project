"use client";
import { useContext, useEffect } from "react";
import { appTheme } from "../util/appTheme";
import { AuthContext } from "../contexts/authContext";
import { useModal2Store } from "../store/useModalStore";
import { useAppContext } from "@/contexts/appContext";
import { usePathname } from "next/navigation";

type Modal2ContinueProps = {
  text: string;
  threeOptions: boolean;
  onContinue: () => void;
  onNoSave?: () => void;
};

const Modal2Continue: React.FC<Modal2ContinueProps> = ({
  text,
  threeOptions,
  onContinue,
  onNoSave,
}) => {
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);

  const handleContinue = () => {
    setModal2({ ...modal2, open: false });
    onContinue();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleContinue();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCancel = () => {
    setModal2({
      ...modal2,
      open: false,
    });
  };

  const handleNoSave = () => {
    setModal2({
      ...modal2,
      open: false,
    });

    if (onNoSave) {
      onNoSave();
    }
  };

  const { currentUser } = useContext(AuthContext);
  if (!currentUser) return null;
  return (
    <div className="pt-[10px] w-full h-full flex items-center justify-center flex-col gap-[15px]">
      <div
        style={{ color: appTheme[currentUser.theme].text_1 }}
        className="text-center"
      >
        {text}
      </div>
      <div className="h-[40px] px-[20px] flex flex-row gap-[10px] w-[100%]">
        <div
          className="select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
          style={{
            width: threeOptions ? "50%" : "33%",
            color: appTheme[currentUser.theme].text_1,
            backgroundColor: appTheme[currentUser.theme].background_2_2,
          }}
          onClick={handleCancel}
        >
          Cancel
        </div>
        {threeOptions && (
          <div
            className="w-[33%] select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
            style={{
              color: appTheme[currentUser.theme].text_1,
              backgroundColor: appTheme[currentUser.theme].background_2_2,
            }}
            onClick={handleNoSave}
          >
            No
          </div>
        )}
        <div
          className="w-[50%] select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
          style={{
            width: threeOptions ? "50%" : "33%",
            color: appTheme[currentUser.theme].background_1_2,
            backgroundColor: appTheme[currentUser.theme].text_3,
          }}
          onClick={handleContinue}
        >
          {threeOptions ? "Yes" : "Continue"}
        </div>
      </div>
    </div>
  );
};

export default Modal2Continue;
