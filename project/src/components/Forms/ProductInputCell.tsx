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

const ProductInputCell = <T extends FieldValues>({
  inputType,
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
  onType,
}: {
  inputType: "input" | "textarea" | "dropdown" | "date";
  name: Path<T>;
  inputMode?: "text" | "numeric" | "decimal";
  pattern?: string;
  register: UseFormRegister<T>;
  registerOptions?: RegisterOptions<T, Path<T>>;
  error?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
  onInput?: React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>["onInput"];
  options?: string[];
  selected?: Date | undefined;
  onChange?: (date: Date | null) => void;
  onCancel?: () => void;
  onType?: (newValue: string) => void;
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
      {inputType === "input" ? (
        <input
          {...register(name, registerOptions)}
          type={"text"}
          inputMode={inputMode}
          pattern={pattern}
          onInput={onInput}
          disabled={disabled}
          className={`input h-[100%] w-[100%] ${
            name === "price" && "pl-[11px] [@media(min-width:550px)]:pl-[8px]"
          } pl-[7px] pr-[6px] py-[4px] text-[12px]`}
          style={{
            borderRight: `0.5px solid ${
              appTheme[currentUser.theme].background_3
            }`,
          }}
        />
      ) : inputType === "textarea" ? (
        <textarea
          {...register(name)}
          className="resize-none input h-[100%] w-[100%] px-[6px] py-[4px] text-[12px]"
          disabled={disabled}
          rows={rows}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (onType) {
              onType(e.target.value);
            }
          }}
          style={{
            borderRight: `0.5px solid ${
              appTheme[currentUser.theme].background_3
            }`,
          }}
        />
      ) : inputType === "dropdown" ? (
        <select
          {...register(name)}
          style={{
            borderRight: `0.5px solid ${
              appTheme[currentUser.theme].background_3
            }`,
          }}
          className="custom-select input w-[100%] h-[100%] px-[6px] py-[4px] text-[12px]"
          onInput={onInput}
        >
          {options &&
            options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
      ) : inputType === "date" ? (
        <div
          style={{
            borderRight: `0.5px solid ${
              appTheme[currentUser.theme].background_3
            }`,
          }}
        >
          <DatePicker
            selected={selected}
            onChange={onChange}
            className="text-[12px] pl-[8px] pb-[2px] w-[100%] h-[100%] min-h-[60px]"
            placeholderText="Select Date"
          />
        </div>
      ) : (
        <></>
      )}

      {error && (
        <div
          style={{ backgroundColor: appTheme[currentUser.theme].background_3 }}
          className="z-[800] flex items-center text-left px-[10px] absolute left-[calc(100%-7px)] top-[5px] rounded-[10px] min-h-[50px] whitespace-nowrap w-auto"
        >
          <p className="text-red-500 text-[13px] whitespace-nowrap">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProductInputCell;
