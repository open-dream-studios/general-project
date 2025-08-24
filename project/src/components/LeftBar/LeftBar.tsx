"use client";
import { useEffect, RefObject, useRef, useState, useContext } from "react";
import {
  useLeftBarOpenStore,
  useLeftBarRefStore,
} from "../../store/useLeftBarOpenStore";
import { useModal2Store } from "../../store/useModalStore";
import Modal2Continue from "../../modals/Modal2Continue";
import { appTheme } from "../../util/appTheme";
import appDetails from "../../util/appDetails.json";
import { AuthContext } from "@/contexts/authContext";
import { MdLibraryBooks } from "react-icons/md";
import { LuPanelLeftClose } from "react-icons/lu";
import { BiWindows } from "react-icons/bi";
import { usePageLayoutRefStore } from "@/store/usePageLayoutStore";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/contexts/appContext";
import { HiHome } from "react-icons/hi2";

const LeftBar = () => {
  const pathname = usePathname();
  const { currentUser, handleLogout } = useContext(AuthContext);
  const { pageClick } = useAppContext();
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);
  const leftBarRef = useRef<HTMLDivElement>(null);
  const setLeftBarRef = useLeftBarRefStore((state) => state.setLeftBarRef);
  const leftBarOpen = useLeftBarOpenStore((state: any) => state.leftBarOpen);
  const setLeftBarOpen = useLeftBarOpenStore(
    (state: any) => state.setLeftBarOpen
  );
  const [showLeftBar, setShowLeftBar] = useState<boolean>(false);
  const showLeftBarRef = useRef<HTMLDivElement>(null);

  const pageLayoutRef = usePageLayoutRefStore((state) => state.pageLayoutRef);

  useEffect(() => {
    setLeftBarRef(leftBarRef as RefObject<HTMLDivElement>);
  }, [setLeftBarRef, leftBarRef]);

  // Global State -> Set local state -> Trigger fade in
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (leftBarOpen) {
      setShowLeftBar(true);
    } else {
      if (showLeftBarRef.current) {
        showLeftBarRef.current.style.opacity = "0";
        showLeftBarRef.current.style.backgroundColor = "transparent";
      }
      timeout = setTimeout(() => {
        setShowLeftBar(false);
      }, 500);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [leftBarOpen]);

  // Local State -> Trigger fade out
  useEffect(() => {
    if (showLeftBar) {
      requestAnimationFrame(() => {
        if (showLeftBarRef.current) {
          showLeftBarRef.current.style.opacity = "1";
          showLeftBarRef.current.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        }
      });
    }
  }, [showLeftBar]);

  const closeLeftBar = () => {
    if (leftBarRef && leftBarRef.current) {
      leftBarRef.current.style.transition = "right 0.3s ease-in-out";
    }
    setLeftBarOpen(false);
    setTimeout(() => {
      if (leftBarRef && leftBarRef.current) {
        leftBarRef.current.style.transition = "none";
      }
    }, 300);

    if (pageLayoutRef && pageLayoutRef.current) {
      pageLayoutRef.current.style.transition =
        "width 0.3s ease-in-out, left 0.3s ease-in-out";
    }
    setTimeout(() => {
      if (pageLayoutRef && pageLayoutRef.current) {
        pageLayoutRef.current.style.transition = "none";
      }
    }, 300);
  };

  const leftBarOpenRef = useRef(leftBarOpen);
  useEffect(() => {
    leftBarOpenRef.current = leftBarOpen;
  }, [leftBarOpen]);

  const windowLargeRef = useRef<boolean>(window.innerWidth > 1024);
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 1024 && !windowLargeRef.current) {
        windowLargeRef.current = true;
        setLeftBarOpen(true);
      }
      if (window.innerWidth < 1024 && windowLargeRef.current) {
        windowLargeRef.current = false;
        setLeftBarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setLeftBarOpen]);
  if (windowWidth === null) return null;

  const offsetHeight =
    appDetails.left_bar_full || windowWidth < 1024 ? 0 : appDetails.nav_height;

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

  const handlePageClick = (newPage: string) => {
    if (windowWidth < 1024) {
      closeLeftBar();
    }
    pageClick(newPage);
  };

  if (!currentUser) return null;

  return (
    <div className="display-height">
      <div
        style={
          {
            "--left-bar-width": appDetails.left_bar_width,
            "--offset-height": `${offsetHeight}px`,
            top: `${offsetHeight}px`,
          } as React.CSSProperties
        }
        className="z-[921] pointer-events-none w-[calc(var(--left-bar-width))] h-[calc(100%-var(--offset-height))] left-0 fixed"
      >
        <div
          ref={leftBarRef}
          style={{
            backgroundColor: appTheme[currentUser.theme].background_1,
            borderRight: `0.5px solid ${
              appTheme[currentUser.theme].background_2
            }`,
          }}
          className={`z-[951] pointer-events-auto ${
            leftBarOpen ? "right-0" : "right-[100%]"
          } absolute top-0 h-[100%] w-[100%] flex justify-center
          `}
        >
          <div
            style={{
              color: appTheme[currentUser.theme].text_1,
            }}
            className="relative w-[100%] h-[100%] px-[20px] pt-[5px] items-start flex flex-col"
          >
            <div
              onClick={() => pageClick("/")}
              className="flex lg:hidden flex-row mt-[22px] gap-[5px] mb-[18px] items-center cursor-pointer dim hover:brightness-75 pr-[6px]"
            >
              <img
                src={
                  "https://res.cloudinary.com/dlzspcvgq/image/upload/v1755991284/logo2_vl8kom.png"
                }
                alt="logo"
                className={`select-none ml-[3px] mt-[-1px] w-[31px] h-[31px] object-cover`}
              />

              <p
                className="select-none text-[20px] font-[700] ml-[8px] mt-[-1px]"
                style={{
                  color: appTheme[currentUser.theme].text_1,
                }}
              >
                Download
              </p>
            </div>

            <div className="w-[100%] justify-between flex flex-row items-center mt-[3px]">
              <div
                onClick={() => {
                  handlePageClick("/");
                }}
                className="mt-[5px] dim hover:brightness-75 cursor-pointer w-[100%] flex gap-[7px] items-center rounded-[10px] px-[12px] py-[5px] pb-[7px]"
                style={{
                  backgroundColor:
                    pathname === "/"
                      ? appTheme[currentUser.theme].background_2
                      : "transparent",
                  color: appTheme[currentUser.theme].text_1,
                }}
              >
                <HiHome className="w-[18px] h-[18px] mr-[1px]" />
                <p className="font-[500]">Home</p>
              </div>
              <LuPanelLeftClose
                style={{ color: appTheme[currentUser.theme].text_4 }}
                className="hidden lg:block dim cursor-pointer brightness-75 hover:brightness-50 w-[24px] h-[24px] mr-[-8px] ml-[10px] mt-[5px]"
                onClick={() => {
                  closeLeftBar();
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: appTheme[currentUser.theme].background_2,
              }}
              className="w-[100%] h-[1px] rounded-[1px] my-[15px]"
            ></div>

            {/* <div
              className="mt-[5px] dim hover:brightness-75 cursor-pointer w-[100%] flex gap-[7px] items-center rounded-[10px] px-[12px] py-[5px]"
              style={{
                backgroundColor:
                  pathname === "/products"
                    ? appTheme[currentUser.theme].background_2
                    : "transparent",
              }}
              onClick={() => {
                handlePageClick("/products");
              }}
            >
              <MdLibraryBooks className="w-[17px] h-[17px]" />
              <p>Products</p>
            </div> */}
          </div>

          <div
            onClick={handleSignOut}
            className="dim select-none cursor-pointer w-[80%] hover:brightness-75 h-[40px] absolute bottom-[20px] flex items-center justify-center font-[600]"
            style={{
              borderRadius: "6px",
              backgroundColor: appTheme[currentUser.theme].background_2,
              color: appTheme[currentUser.theme].text_2,
            }}
          >
            Sign out
          </div>
        </div>
      </div>

      {showLeftBar && windowWidth !== null && (
        <div
          className={`z-[920] flex ${
            windowWidth < 1024 ? "" : "hidden"
          } w-full h-full fixed top-0 left-0`}
        >
          <div
            ref={showLeftBarRef}
            onClick={closeLeftBar}
            className="absolute top-0 left-0 w-[100vw] display-height flex items-center justify-center"
            style={{
              opacity: 0,
              transition:
                "opacity 0.5s ease-in-out, backdrop-filter 0.5s ease-in-out, -webkit-backdrop-filter 0.5s ease-in-out, background-color 0.5s ease-in-out",
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default LeftBar;
