"use client";
import { useEffect, RefObject, useRef, useState } from "react";
import {
  useLeftBarOpenStore,
  useLeftBarRefStore,
} from "../../../store/useLeftBarOpenStore";
import { appTheme } from "../../../util/appTheme";
import { ThemeType } from "../../../util/appTheme";
import appDetails from "../../../util/appDetails.json";
import { login } from "@/util/auth";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const LandingLeftBar = () => {
  const router = useRouter();
  const queryClient = useQueryClient()
  const defaultTheme = appDetails.default_theme as ThemeType;
  const leftBarRef = useRef<HTMLDivElement>(null);
  const setLeftBarRef = useLeftBarRefStore((state) => state.setLeftBarRef);
  const leftBarOpen = useLeftBarOpenStore((state: any) => state.leftBarOpen);
  const setLeftBarOpen = useLeftBarOpenStore(
    (state: any) => state.setLeftBarOpen
  );
  const [showLeftBar, setShowLeftBar] = useState<boolean>(false);
  const showLeftBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLeftBarRef(leftBarRef as RefObject<HTMLDivElement>);
  }, [setLeftBarRef, leftBarRef]);

  const handleSignInClick = async (e: any) => {
    e.preventDefault();
    const success = await login({
      email: "guest@gmail.com",
      password: "guest",
    });
    if (success) {
      router.push('/');
      window.location.href = '/'; 
    }
  };

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

  const toggleLeftBar = () => {
    if (leftBarRef && leftBarRef.current) {
      leftBarRef.current.style.transition = "right 0.3s ease-in-out";
    }
    setLeftBarOpen(false);
    setTimeout(() => {
      if (leftBarRef && leftBarRef.current) {
        leftBarRef.current.style.transition = "none";
      }
    }, 300);
  };

  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 1024) {
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
  return (
    <div>
      <div
        style={
          {
            "--left-bar-width": appDetails.left_bar_width,
            "--offset-height": `${offsetHeight}px`,
            top: `${offsetHeight}px`,
          } as React.CSSProperties
        }
        className="z-[921] pointer-events-none w-[calc(var(--left-bar-width))] h-[calc(100vh-var(--offset-height))] left-0 fixed"
      >
        {/* <div
          ref={leftBarRef}
          style={{
            backgroundColor: appTheme[defaultTheme].background_1,
          }}
          className={`z-[951] pointer-events-auto lg:right-0 ${
            leftBarOpen ? "right-0" : "right-[100%]"
          } absolute top-0 h-[100%] w-[100%] flex justify-center`}
        >
          <div
            onClick={handleSignInClick}
            className="dim select-none cursor-pointer w-[80%] hover:brightness-75 h-[40px] absolute bottom-[20px] flex items-center justify-center font-[600]"
            style={{
              borderRadius: "6px",
              backgroundColor: appTheme[defaultTheme].background_2,
              color: appTheme[defaultTheme].text_2,
            }}
          >
            Sign in
          </div>
        </div> */}
      </div>

      {showLeftBar && windowWidth !== null && (
        <div
          className={`z-[920] flex ${
            windowWidth < 1024 ? "" : "hidden"
          } w-full h-full fixed top-0 left-0`}
        >
          <div
            ref={showLeftBarRef}
            onClick={toggleLeftBar}
            className="absolute top-0 left-0 w-[100vw] h-[100vh] flex items-center justify-center"
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

export default LandingLeftBar;
