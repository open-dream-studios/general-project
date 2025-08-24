"use client";
import { IoCloseOutline } from "react-icons/io5";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { appTheme } from "@/util/appTheme";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
import { UseFormSetValue, UseFormGetValues } from "react-hook-form";
import { ProductFormData } from "./ProductPage";
import { IoPlayCircleOutline } from "react-icons/io5";

function SortableImage({
  id,
  url,
  setImageView,
  images,
  setValue,
}: {
  id: string;
  url: string;
  setImageView: React.Dispatch<React.SetStateAction<string>>;
  images: string[];
  setValue: UseFormSetValue<ProductFormData>;
}) {
  const { currentUser } = useContext(AuthContext);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    zIndex: isDragging ? 999 : 1,
    position: "relative",
  };

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const wiggleThreshold = 5;

  const handleMouseDown = (e: React.MouseEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".ignore-click")) return;

    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < wiggleThreshold) {
      setImageView(url);
    }
    startPos.current = null;
  };

  const handleDeleteImage = (url: string) => {
    const updated = images.filter((link) => link !== url);
    setValue("images", updated, { shouldDirty: true });
  };

  if (!currentUser) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative w-full aspect-square"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className=" cursor-pointer hover:brightness-75 dim w-[100%] h-[100%] inset-0">
        <div {...listeners} className="absolute inset-0 z-10 cursor-grab" />
        {/\.(mp4|mov)$/i.test(url) ? (
          <>
            <video
              src={url}
              className="object-cover w-full h-full rounded-[10px]"
              playsInline
              muted
              loop
            />
            <div className="absolute top-0 left-0 w-[100%] h-[100%] flex items-center justify-center pb-[4px]">
              <IoPlayCircleOutline size={35} color={"white"} />
            </div>
          </>
        ) : (
          <Image
            src={url}
            alt="image"
            width={200}
            height={200}
            className="object-cover w-full h-full rounded-[10px]"
          />
        )}
        <div
          style={{
            border: `1px solid ${appTheme[currentUser.theme].text_4}`,
            backgroundColor: appTheme[currentUser.theme].background_1,
          }}
          className="ignore-click w-[20px] h-[20px] flex items-center justify-center dim hover:brightness-75 cursor-pointer rounded-[10px] absolute top-[-8px] right-[-9px] z-20"
          onClick={() => {
            handleDeleteImage(url);
          }}
        >
          <IoCloseOutline color={appTheme[currentUser.theme].text_2} />
        </div>
      </div>
    </div>
  );
}

export default function DraggableImageGrid({
  images,
  setValue,
  getValues,
}: {
  images: string[];
  setValue: UseFormSetValue<ProductFormData>;
  getValues: UseFormGetValues<ProductFormData>;
}) {
  const { currentUser } = useContext(AuthContext);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );
  const [imageView, setImageView] = useState<string>("");

  const items = images.map((url, index) => ({
    id: `${url}-${index}`,
    url,
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(images, oldIndex, newIndex);
    setValue("images", reordered, { shouldDirty: true });
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoTime, setVideoTime] = useState({ current: 0, duration: 0 });

  if (!currentUser) return null;

  return (
    <>
      {imageView !== "" && (
        <div
          className="fixed z-[990] top-0 left-0 w-[100vw] display-height flex items-center justify-center"
          style={{
            backgroundColor: appTheme[currentUser.theme].background_1,
          }}
          onClick={() => setImageView("")}
        >
          {/\.(mp4|mov)$/i.test(imageView) ? (
            <div className="relative max-w-[100%] max-h-[100%]">
              <video
                ref={videoRef}
                src={imageView}
                className="object-contain max-w-[100%] max-h-[90vh]"
                playsInline
                loop
                autoPlay
                onClick={() => setImageView("")}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  setVideoTime({
                    current: v.currentTime,
                    duration: v.duration,
                  });
                }}
              />
              <div
                className="absolute left-0 right-0 bottom-4 px-6"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="range"
                  min={0}
                  max={videoTime.duration || 0}
                  step={0.01}
                  value={videoTime.current || 0}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    if (videoRef.current)
                      videoRef.current.currentTime = newTime;
                    setVideoTime((prev) => ({ ...prev, current: newTime }));
                  }}
                  className="w-full appearance-none bg-transparent cursor-pointer"
                  style={{
                    WebkitAppearance: "none",
                    appearance: "none",
                  }}
                />
                <style jsx>{`
                  input[type="range"] {
                    height: 4px;
                  }
                  input[type="range"]::-webkit-slider-runnable-track {
                    height: 4px;
                    background: #ccc;
                    border-radius: 2px;
                  }
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 14px;
                    width: 14px;
                    border-radius: 50%;
                    background: #d1d5db;
                    margin-top: -5px; /* centers thumb vertically */
                    transition: background 0.2s ease;
                  }
                  input[type="range"]::-webkit-slider-thumb:hover {
                    background: #d1d5db;
                  }
                  input[type="range"]::-moz-range-track {
                    height: 4px;
                    background: #ccc;
                    border-radius: 2px;
                  }
                  input[type="range"]::-moz-range-thumb {
                    height: 14px;
                    width: 14px;
                    border-radius: 50%;
                    background: #d1d5db;
                    border: none;
                    transition: background 0.2s ease;
                  }
                  input[type="range"]::-moz-range-thumb:hover {
                    background: #d1d5db;
                  }
                `}</style>
              </div>
            </div>
          ) : (
            <img
              src={imageView}
              className="object-cover max-w-[100%] max-h-[100%]"
            />
          )}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-[10px] p-1 sm:p-2 md:p-4 touch-none">
              {items.map((item) => (
                <SortableImage
                  key={item.id}
                  id={item.id}
                  url={item.url}
                  setImageView={setImageView}
                  images={images}
                  setValue={setValue}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </>
  );
}
