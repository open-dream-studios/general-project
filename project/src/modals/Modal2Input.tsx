"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { appTheme } from "../util/appTheme";
import { AuthContext } from "../contexts/authContext";
import { useModal2Store } from "../store/useModalStore";
import { Product, useContextQueries } from "@/contexts/queryContext";
import { toast } from "react-toastify";

type Modal2InputProps = {
  text: string;
  onContinue: (serial: string, make: string, model: string) => void;
};

const Modal2Input: React.FC<Modal2InputProps> = ({ text, onContinue }) => {
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);
  const { currentUser } = useContext(AuthContext);
  const { productsData } = useContextQueries();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValues, setInputValues] = useState({
    serial: "TSA",
    make: "",
    model: "",
  });

  const [step, setStep] = useState<"serial" | "make" | "model">("serial");
  const [input, setInput] = useState("TSA");
  const [error, setError] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  if (!currentUser) return null;

  const handleContinue = () => {
    const trimmed = input.trim();
    if (step === "serial") {
      if (trimmed.length < 14) {
        setError(true);
        inputRef.current?.focus();
        return;
      } else if (
        productsData.some((item: Product) => item.serial_number === trimmed)
      ) {
        toast.error("Product ID already in use");
        return;
      }
    }

    setError(false);

    const updatedValues = { ...inputValues, [step]: trimmed };
    setInputValues(updatedValues);
    setInput("");

    if (step === "serial") setStep("make");
    else if (step === "make") {
      const trimmed = input.trim();
      if (trimmed.length === 0) {
        inputRef.current?.focus();
        return;
      }
      setStep("model");
    } else {
      const trimmed = input.trim();
      if (trimmed.length === 0) {
        inputRef.current?.focus();
        return;
      }
      setModal2({ ...modal2, open: false });
      onContinue(updatedValues.serial, updatedValues.make, updatedValues.model);
    }
  };

  const placeholderMap = {
    serial: "New Serial",
    make: "Make...",
    model: "Model...",
  };

  const sanitizeInput = (value: string) => {
    if (step === "serial") {
      return value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 20);
    }
    return value;
  };

  return (
    <div className="pt-[2px] w-full h-full flex items-center justify-center flex-col gap-[10px]">
      <div
        style={{ color: appTheme[currentUser.theme].text_1 }}
        className="relative w-[250px]"
      >
        <input
          type="text"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(sanitizeInput(e.target.value))}
          placeholder={placeholderMap[step]}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleContinue();
            }
          }}
          style={{
            backgroundColor: appTheme[currentUser.theme].background_2_2,
            color: appTheme[currentUser.theme].text_1,
          }}
          className="rounded-[7px] w-full px-[11px] py-[5px]"
        />
        {error && step === "serial" && (
          <div className="absolute top-[7px] right-[16px] text-red-500 text-[14px]">
            14 CHARS
          </div>
        )}
      </div>

      <div className="w-full h-[40px] px-[25px] flex flex-row gap-[10px]">
        <div
          className="select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
          style={{
            color: appTheme[currentUser.theme].text_1,
            backgroundColor: appTheme[currentUser.theme].background_2_2,
          }}
          onClick={() => setModal2({ ...modal2, open: false })}
        >
          Cancel
        </div>

        <div
          className="select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
          style={{
            color: appTheme[currentUser.theme].background_1_2,
            backgroundColor: appTheme[currentUser.theme].text_3,
          }}
          onClick={handleContinue}
        >
          Continue
        </div>
      </div>
    </div>
  );
};

export default Modal2Input;
