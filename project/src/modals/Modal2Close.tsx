"use client"
import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { appTheme, ThemeType } from "../util/appTheme";
import { useModal2Store } from "../store/useModalStore";
import appDetails from "../util/appDetails.json"

const Modal2Close = ({ text }: { text: string }) => {
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);
  const { currentUser } = useContext(AuthContext);

  const currentTheme = currentUser ? currentUser.theme : appDetails.default_theme as ThemeType

  return (
    <div className="pt-[10px] px-[50px] w-full h-full flex items-center justify-center flex-col gap-[15px]">
      <div
        style={{ color: appTheme[currentTheme].text_1 }}
        className="text-center"
      >
        {text}
      </div>
      <div className="w-full h-[40px] px-[25px] flex flex-row gap-[10px]">
        <div
          className="select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
          style={{
            color: appTheme[currentTheme].text_1,
            backgroundColor: appTheme[currentTheme].background_2_2,
          }}
          onClick={() => {
            setModal2({
              ...modal2,
              open: false,
            });
          }}
        >
          Close
        </div>
      </div>
    </div>
  );
};

export default Modal2Close;
