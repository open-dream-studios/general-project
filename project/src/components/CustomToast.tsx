"use client";
import { useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthContext } from "@/contexts/authContext";
import { appTheme } from "@/util/appTheme";
import { PiXCircleThin } from "react-icons/pi";
import { GoCheckCircle } from "react-icons/go";

let triggerToast: (message: string, type?: "success" | "error") => void;

export const showToast = (
  message: string,
  type: "success" | "error" = "success"
) => {
  if (triggerToast) triggerToast(message, type);
};

export default function CustomToast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error">("success");
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    triggerToast = (msg, type: any) => {
      setMessage(msg);
      setType(type);
      setVisible(true);
      setTimeout(() => setVisible(false), 3500);
    };
  }, []);

  if (!currentUser) return null;

  return (
    <div className="z-[999] fixed bottom-4 right-4">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 800, damping: 100 }}
            className={`z-[1000] px-[14px] py-[9px] rounded shadow-lg border-b-[2px]`}
            style={{
              color: appTheme[currentUser.theme].text_3,
              backgroundColor: appTheme[currentUser.theme].background_1,
              borderColor: appTheme[currentUser.theme].text_1,
            }}
          >
            <div className="h-[21px] font-[200] flex flex-row gap-[6px] items-center text-[14px] leading-[14px] justify-start text-center">
              <span>
                {type === "error" ? <PiXCircleThin className="w-[24px] h-[24px]" /> : <GoCheckCircle className="mr-[2px] w-[19px] h-[19px]" />}
              </span>
              <span className="">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
