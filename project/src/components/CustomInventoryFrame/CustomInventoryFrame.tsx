"use client";
import { AuthContext } from "@/contexts/authContext";
import { Product } from "@/contexts/queryContext";
import { appTheme } from "@/util/appTheme";
import { capitalizeFirstLetter } from "@/util/functions/Data";
import Link from "next/link";
import { useContext } from "react";
import app_details from "@/util/appDetails.json";
import { useRouter } from "next/navigation";

const CustomInventoryFrame = ({
  item,
  index,
}: {
  item: Product;
  index: number;
}) => {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();
  const TubTitle = item.name;
  const TubMake = item.make;
  const TubModel = item.model;
  const TubPrice = "$" + item.price;
  const TubID = item.serial_number;

  const handleClick = () => {
    router.push(
      TubID && TubID.trim().length !== 0 ? `/products/${TubID}` : "/products"
    );
  };

  if (!currentUser) return null;

  return (
    <div
      onClick={handleClick}
      className="select-none group hover:brightness-75 dim cursor-pointer rounded-[5px] overflow-hidden relative w-[100%] flex flex-col"
      style={{
        backgroundColor: appTheme[currentUser.theme].background_2,
      }}
    >
      <div className="dim w-[100%] h-[100%] select-none">
        <div className="relative w-[100%] aspect-[16/9] overflow-hidden">
          {item.images.length === 0 ? (
            <img
              draggable={false}
              className="w-[100%] h-[100%] object-cover"
              src={app_details.default_img}
            />
          ) : /\.(mp4|mov)$/i.test(item.images[0]) ? (
            <video
              src={item.images[0]}
              className="object-cover w-full h-full"
              playsInline
              muted
              loop
            />
          ) : (
            <img
              draggable={false}
              className="w-[100%] h-[100%] object-cover"
              src={item.images[0]}
            />
          )}

          <div
            style={{
              backgroundColor: appTheme[currentUser.theme].background_2,
            }}
            className="absolute bottom-[9px] right-[10px] py-[6px] px-[10px] rounded-[6px] flex flex-row gap-[6px] items-center justify-center"
          >
            <p
              style={{ color: appTheme[currentUser.theme].text_1 }}
              className="text-[11px] leading-[11px] font-[400] mt-[1px]"
            >
              {TubPrice && TubPrice.trim().length !== 0 ? TubPrice : "No Price"}
            </p>
          </div>
        </div>
        <div className="w-[100%] relative flex flex-col pt-[5px] mb-[47px] px-[13px] gap-[6px]">
          <p
            className="font-[500] truncate w-[100%] overflow-hidden text-[14px] leading-[14px] tracking-[0.2px] mt-[5px]"
            style={{
              color: appTheme[currentUser.theme].text_1,
            }}
          >
            {TubTitle.trim().length > 0
              ? capitalizeFirstLetter(TubTitle)
              : TubID}
          </p>
        </div>
      </div>

      <div className="dim absolute bottom-[7px] left-0 mx-[9px] py-[2px] pr-[6px] pl-[4px]  w-fit flex flex-row gap-[8px] items-center">
        <div
          className="w-[25px] h-[25px] min-w-[25px] overflow-hidden rounded-full"
          style={{
            backgroundColor: appTheme[currentUser.theme].background_2_2,
            border: `0.5px solid ${appTheme[currentUser.theme].background_4}`,
          }}
        >
          <img
            draggable={false}
            className="w-[100%] h-[100%] p-[5px] object-contain"
            src={"/assets/logo-black.png"}
          />
        </div>
        <div
          className={`overflow-hidden flex flex-col w-[100%] gap-[3px] ${
            TubTitle.trim().length === 0 && "py-[6.5px]"
          }`}
        >
          <p
            className="truncate overflow-hidden font-[400] w-[100%] text-[14px] leading-[14px] tracking-[0.2px]"
            style={{
              color: appTheme[currentUser.theme].text_1,
            }}
          >
            {TubMake && TubMake.trim().length !== 0
              ? TubModel && TubModel.trim().length !== 0
                ? `${capitalizeFirstLetter(TubMake)} | ${capitalizeFirstLetter(
                    TubModel
                  )}`
                : capitalizeFirstLetter(TubMake)
              : ""}
          </p>

          <p
            className={`truncate overflow-hidden font-[300] w-[100%] text-[10px] leading-[12px] tracking-[0.2px]`}
            style={{
              color: appTheme[currentUser.theme].text_1,
            }}
          >
            {TubTitle.trim().length > 0 ? (
              TubID && TubID.trim().length !== 0 ? (
                TubID
              ) : (
                "No ID"
              )
            ) : (
              <></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomInventoryFrame;
