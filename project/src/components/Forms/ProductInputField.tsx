"use client";
import { AuthContext } from "@/contexts/authContext";
import { appTheme } from "@/util/appTheme";
import { useContext } from "react";
import {
  FieldValues,
  Path,
  UseFormRegister,
  RegisterOptions,
} from "react-hook-form";
import DatePicker from "react-datepicker";
import { IoClose } from "react-icons/io5";

const ProductInputField = <T extends FieldValues>({
  inputType,
  label,
  name,
  inputMode,
  pattern,
  register,
  registerOptions,
  error,
  disabled = false,
  className,
  rows = 3,
  onInput,
  options,
  selected,
  onChange,
  onCancel,
}: {
  inputType: "input" | "textarea" | "dropdown" | "date";
  label: string;
  name: Path<T>;
  inputMode?: "text" | "numeric" | "decimal";
  pattern?: string;
  register: UseFormRegister<T>;
  registerOptions?: RegisterOptions<T, Path<T>>;
  error?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
  onInput?: React.InputHTMLAttributes<HTMLInputElement>["onInput"];
  options?: string[];
  selected?: Date | undefined;
  onChange?: (date: Date | null) => void;
  onCancel?: () => void;
}) => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) return null;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        ["--custom-input-text-color" as any]:
          appTheme[currentUser.theme].text_1,
      }}
    >
      <label className="block font-[400]">{label}</label>
      {inputType === "input" ? (
        <input
          {...register(name, registerOptions)}
          type={"text"}
          inputMode={inputMode}
          pattern={pattern}
          onInput={onInput}
          disabled={disabled}
          className="input rounded-[7px] w-[100%] mt-[6px] px-[10px] py-[4px]"
          style={{
            border: `0.5px solid ${
              currentUser.theme === "light"
                ? appTheme[currentUser.theme].text_3
                : appTheme[currentUser.theme].text_4
            }`,
          }}
        />
      ) : inputType === "textarea" ? (
        <textarea
          {...register(name)}
          className="resize-none input rounded-[7px] w-[100%] mt-[6px] px-[10px] py-[4px]"
          disabled={disabled}
          style={{
            border: `0.5px solid ${
              currentUser.theme === "light"
                ? appTheme[currentUser.theme].text_3
                : appTheme[currentUser.theme].text_4
            }`,
          }}
          rows={rows}
        />
      ) : inputType === "dropdown" ? (
<div className="relative">
  <select
    {...register(name)}
    className="input rounded-[7px] w-full px-3 py-[4px] custom-select pr-8"
    style={{
      appearance: "none",
      WebkitAppearance: "none",
      backgroundColor: "transparent",
      border: `0.5px solid ${
        currentUser.theme === "light"
          ? appTheme[currentUser.theme].text_3
          : appTheme[currentUser.theme].text_4
      }`,
      color: appTheme[currentUser.theme].text_1,
    }}
  >
    {options &&
      options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
  </select>
  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill={appTheme[currentUser.theme].text_1}
      viewBox="0 0 20 20"
    >
      <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
    </svg>
  </div>
</div>
      ) : inputType === "date" ? (
        <div className="flex flex-row gap-[10px] mt-[6px]">
          <div
            className="rounded-[8px] w-fit"
            style={{
              border: `0.5px solid ${
                currentUser.theme === "light"
                  ? appTheme[currentUser.theme].text_3
                  : appTheme[currentUser.theme].text_4
              }`,
            }}
          >
            <DatePicker
              selected={selected}
              onChange={onChange}
              className="input w-[100%] h-[100%] px-[8px] py-[7px]"
              placeholderText="Select Date"
            />
          </div>

          {selected && name === "date_sold" && (
            <div
              onClick={onCancel}
              style={{
                backgroundColor: appTheme[currentUser.theme].background_3,
              }}
              className="flex items-center justify-center w-[34.5px] h-[34px] pb-[0.5px] pr-[0.5px] rounded-[6px] cursor-pointer dim hover:brightness-75"
            >
              <IoClose
                color={appTheme[currentUser.theme].background_1}
                size={29}
              />
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
      {error && <p className="text-red-500 text-sm mt-[10px]">{error}</p>}
    </div>
  );
};

export default ProductInputField;
