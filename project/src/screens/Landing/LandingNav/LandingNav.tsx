"use client";
import { HiBars3 } from "react-icons/hi2";
import { appTheme, ThemeType } from "../../../util/appTheme";
import {
  useLeftBarOpenStore,
  useLeftBarRefStore,
} from "../../../store/useLeftBarOpenStore";
import appDetails from "../../../util/appDetails.json";
import { useModal1Store } from "../../../store/useModalStore";
import Login from "../Login/Login";
import { removeWhiteSpace } from "@/util/functions/Data";

const LandingNav = () => {
  const defaultTheme = appDetails.default_theme as ThemeType;
  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);
  const leftBarOpen = useLeftBarOpenStore((state: any) => state.leftBarOpen);
  const setLeftBarOpen = useLeftBarOpenStore(
    (state: any) => state.setLeftBarOpen
  );
  const leftBarRef = useLeftBarRefStore((state) => state.leftBarRef);

  const toggleLeftBar = () => {
    if (leftBarRef && leftBarRef.current) {
      leftBarRef.current.style.transition = "right 0.3s ease-in-out";
    }
    setLeftBarOpen(!leftBarOpen);
    setTimeout(() => {
      if (leftBarRef && leftBarRef.current) {
        leftBarRef.current.style.transition = "none";
      }
    }, 300);
  };

  const handleSignInClick = () => {
    setModal1({
      ...modal1,
      open: !modal1.open,
      showClose: true,
      width: "w-[100vw] sm:w-[90vw] h-[100vh] sm:h-[auto]",
      maxWidth: "max-w-[1000px] min-h-[655px] sm:min-h-[500px]",
      aspectRatio: "sm:aspect-[3/3.4] md:aspect-[5/4.5] lg:aspect-[5/3.9]",
      borderRadius: "rounded-0 sm:rounded-[15px] md:rounded-[20px]",
      content: <Login />,
    });
  };

  return (
    <div
      style={
        {
          "--nav-height": `${appDetails.nav_height}px`,
          "--left-bar-width": removeWhiteSpace(appDetails.left_bar_width),
          "--nav-ml": appDetails.left_bar_width,
          // backgroundColor: appTheme[defaultTheme].background_1,
          backgroundColor: "black",
        } as React.CSSProperties
      }
      className={`fixed z-[900] ${
        appDetails.left_bar_full
          ? "w-[100vw] lg:w-[calc(100vw-(var(--left-bar-width))] lg:ml-[calc(var(--nav-ml))]"
          : "w-[100vw]"
      } h-[var(--nav-height)]`}
    >
      <div className="w-[100%] h-[100%] absolute flex justify-between items-center">
        <div className="flex flex-row items-center px-[18px]">
          {/* <HiBars3
            onClick={() => {
              toggleLeftBar();
            }}
            className="w-[30px] dim cursor-pointer lg:hidden hover:brightness-75"
            color={appTheme[defaultTheme].text_1}
            fontSize={29}
          /> */}
          <div className="flex flex-row gap-[5px] items-center">
            <img
              src="https://res.cloudinary.com/dlzspcvgq/image/upload/v1755991284/logo2_vl8kom.png"
              alt="logo"
              className="select-none ml-[3px] mt-[-1px] w-[35px] h-[35px] object-cover"
            />
            <p
              className="dim select-none text-[23px] font-[700] ml-[2px] hover:brightness-75"
              style={{
                color: appTheme[defaultTheme].text_1,
              }}
            >
              YouTube Download
            </p>
          </div>
        </div>

        <div className="h-[100%] mr-[18px] pr-[2px] flex items-center">
          <div
            onClick={handleSignInClick}
            style={{
              backgroundColor: "#1B3167",
            }}
            className="cursor-pointer select-none dim hover:brightness-75 px-[17px] py-[5.5px] text-[14px] font-[600] text-white/90 rounded-[7px]"
          >
            Sign in
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingNav;
