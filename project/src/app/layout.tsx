import type { Metadata } from "next";
import { appTheme, ThemeType } from "@/util/appTheme";
import appDetails from "../util/appDetails.json";
import AppLayout from "../layouts/appLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "YouTube Download",
  description: "YouTube Download",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{
        backgroundColor:
          appTheme[appDetails.default_theme as ThemeType].background_1,
      }}
    >
      <body>
        <AppLayout>{children}</AppLayout>
        <ToastContainer />
      </body>
    </html>
  );
}
