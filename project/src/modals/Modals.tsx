"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useModal1Store, useModal2Store } from "../store/useModalStore";
import { appTheme, ThemeType } from "../util/appTheme";
import { AuthContext } from "../contexts/authContext";
import { IoCloseOutline } from "react-icons/io5";
import appDetails from "../util/appDetails.json";

const Modals = ({ landing }: { landing: boolean }) => {
  let currentTheme = appDetails.default_theme as ThemeType;
  const { currentUser } = useContext(AuthContext);
  if (!landing && currentUser) {
    currentTheme = currentUser.theme
  }

  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);

  const [showModal1, setShowModal1] = useState<boolean>(false);
  const [showModal2, setShowModal2] = useState<boolean>(false);

  const modal1Ref = useRef<HTMLDivElement>(null);
  const modal2Ref = useRef<HTMLDivElement>(null);

  // MODAL 1
  // Global State -> Set local state -> Trigger fade in
  useEffect(() => {
    if (modal1.open) {
      setShowModal1(true);
    } else {
      if (modal1Ref.current) {
        modal1Ref.current.style.opacity = "0";
        modal1Ref.current.style.backgroundColor = "transparent";
        //   modal1Ref.current.style.backdropFilter = "none";
        //   modal1Ref.current.style.setProperty("-webkit-backdrop-filter", "none");
      }
      setTimeout(() => {
        setShowModal1(false);
      }, 500);
    }
  }, [modal1]);

  // Local State -> Trigger fade out
  useEffect(() => {
    if (showModal1) {
      requestAnimationFrame(() => {
        if (modal1Ref.current) {
          modal1Ref.current.style.opacity = "1";
          modal1Ref.current.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
          // modal1Ref.current.style.backdropFilter = "blur(0.5px)";
          // modal1Ref.current.style.setProperty(
          //   "-webkit-backdrop-filter",
          //   "blur(0.5px)"
          // );
        }
      });
    }
  }, [showModal1]);

  // MODAL 2
  useEffect(() => {
    if (modal2.open) {
      setShowModal2(true);
    } else {
      if (modal2Ref.current) {
        modal2Ref.current.style.opacity = "0";
        modal2Ref.current.style.backgroundColor = "transparent";
      }
      setTimeout(() => {
        setShowModal2(false);
      }, 500);
    }
  }, [modal2]);

  useEffect(() => {
    if (showModal2) {
      requestAnimationFrame(() => {
        if (modal2Ref.current) {
          modal2Ref.current.style.opacity = "1";
          modal2Ref.current.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        }
      });
    }
  }, [showModal2]);

  if (!landing && !currentUser) return;

  return (
    <div>
      {showModal1 && (
        <div
          ref={modal1Ref}
          onClick={() => {
            if (modal1.offClickClose) {
              setModal1({ ...modal1, open: false });
            }
          }}
          className="z-[940] fixed top-0 left-0 w-[100vw] display-height flex items-center justify-center"
          style={{
            opacity: 0,
            transition:
              "opacity 0.5s ease-in-out, backdrop-filter 0.5s ease-in-out, -webkit-backdrop-filter 0.5s ease-in-out, background-color 0.5s ease-in-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative overflow-hidden ${modal1.width} ${modal1.maxWidth} ${modal1.aspectRatio} ${modal1.borderRadius}`}
            style={{
              border: `1px solid ${appTheme[currentTheme].background_2_2}`,
              color: appTheme[currentTheme].text_1,
              backgroundColor: appTheme[currentTheme].background_1,
            }}
          >
            {modal1.showClose && (
              <div
                className="dim hover:brightness-90 cursor-pointer absolute right-[13px] top-[10px] w-[36px] h-[36px] rounded-full flex items-center justify-center"
                onClick={() => setModal1({ ...modal1, open: false })}
                style={{
                  backgroundColor: appTheme[currentTheme].background_2_2,
                }}
              >
                <IoCloseOutline
                  color={appTheme[currentTheme].text_3}
                  size={25}
                />
              </div>
            )}
            {modal1.content}
          </div>
        </div>
      )}
      {showModal2 && (
        <div
          ref={modal2Ref}
          onClick={() => {
            if (modal2.offClickClose) {
              setModal2({ ...modal2, open: false });
            }
          }}
          className="z-[940] fixed top-0 left-0 w-[100vw] display-height flex items-center justify-center"
          style={{
            opacity: 0,
            transition:
              "opacity 0.5s ease-in-out, backdrop-filter 0.5s ease-in-out, -webkit-backdrop-filter 0.5s ease-in-out, background-color 0.5s ease-in-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative overflow-hidden ${modal2.width} ${modal2.maxWidth} ${modal2.aspectRatio} ${modal2.borderRadius}`}
            style={{
              border: `1px solid ${appTheme[currentTheme].background_2_2}`,
              color: appTheme[currentTheme].text_1,
              backgroundColor: appTheme[currentTheme].background_1_2,
            }}
          >
            {modal2.showClose && (
              <div
                className="dim hover:brightness-90 cursor-pointer absolute right-[13px] top-[10px] w-[36px] h-[36px] rounded-full flex items-center justify-center"
                onClick={() => setModal2({ ...modal2, open: false })}
                style={{
                  backgroundColor: appTheme[currentTheme].background_2_2,
                }}
              >
                <IoCloseOutline
                  color={appTheme[currentTheme].text_3}
                  size={25}
                />
              </div>
            )}
            {modal2.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default Modals;
