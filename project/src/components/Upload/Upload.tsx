"use client";
import { AuthContext } from "@/contexts/authContext";
import { useAppContext } from "@/contexts/appContext";
import { appTheme } from "@/util/appTheme";
import React, { useContext, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { ProductFormData } from "../ProductPage/ProductPage";

interface UploadProps {
  handleFiles: (files: File[]) => void;
}

interface UploadModalProps {
  setValue: UseFormSetValue<ProductFormData>;
  getValues: UseFormGetValues<ProductFormData>;
}

const UploadModal: React.FC<UploadModalProps> = ({ setValue, getValues }) => {
  const { currentUser } = useContext(AuthContext);
  const { uploadPopup, setUploadPopup, handleFiles, uploadPopupRef } =
    useAppContext();
  if (!currentUser) return null;

  return (
    <>
      {uploadPopup && (
        <div className="z-[999] fixed top-0 left-0">
          <div
            className="absolute top-0 w-[100vw] display-height"
            style={{ backgroundColor: "black", opacity: 0.4 }}
          ></div>
          <div className="absolute top-0 w-[100vw] display-height flex items-center justify-center">
            <div
              ref={uploadPopupRef}
              className="shadow-lg w-[85%] sm:w-[70%] aspect-[1/1.2] sm:aspect-[1.5/1] relative"
              style={{
                userSelect: "none",
                borderRadius: "30px",
                border:
                  currentUser.theme === "light"
                    ? `0.5px solid ${appTheme[currentUser.theme].text_2}`
                    : `1px solid ${appTheme[currentUser.theme].background_2}`,
              }}
            >
              <Upload
                handleFiles={(files) => handleFiles(files, setValue, getValues)}
              />
              <IoCloseOutline
                onClick={() => {
                  setUploadPopup(false);
                }}
                className="absolute top-2 right-3"
                style={{ cursor: "pointer" }}
                color={appTheme[currentUser.theme].text_3}
                size={40}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Upload: React.FC<UploadProps> = ({ handleFiles }) => {
  const { currentUser } = useContext(AuthContext);
  const [dragging, setDragging] = useState(false);
  const handleDragOver = (e: any) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  if (!currentUser) return;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: appTheme[currentUser.theme].background_stark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.3s",
        border:
          currentUser.theme === "light"
            ? dragging
              ? "3px dashed blue"
              : "none"
            : "1px solid #333",
        borderRadius: "28px",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p
        className="absolute font-[300]"
        style={{
          fontSize: "1.2rem",
          color:
            currentUser.theme === "light"
              ? dragging
                ? "blue"
                : "black"
              : "#fff",
        }}
      >
        Drag and drop images here
      </p>

      <div className="relative w-[100%] h-[100%] flex justify-center">
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          id="fileInput"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFiles(files);
          }}
        />
        <label
          className="absolute bottom-[20px]"
          htmlFor="fileInput"
          style={{
            marginTop: "20px",
            cursor: "pointer",
            textDecoration: "underline",
            color: currentUser.theme === "dark" ? "#eee" : "blue",
          }}
        >
          Open Finder
        </label>
      </div>
    </div>
  );
};

export default UploadModal;
