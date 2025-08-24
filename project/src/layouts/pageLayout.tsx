import appDetails from "@/util/appDetails.json";
import { ReactNode } from "react";

const PageLayout = ({ children }: { children: ReactNode }) => {
  return <></>
  return (
    <div
      style={
        {
          "--nav-height": `${appDetails.nav_height}px`,
          "--left-bar-width": appDetails.left_bar_width,
        } as React.CSSProperties
      }
      className={`absolute left-0 lg:left-[calc(var(--left-bar-width))] top-[var(--nav-height)] w-[100vw] lg:w-[calc(100vw-(var(--left-bar-width)))] flex h-[calc(100vh-var(--nav-height))] overflow-scroll`}
    >
      {children}
    </div>
  );
};

export default PageLayout;
