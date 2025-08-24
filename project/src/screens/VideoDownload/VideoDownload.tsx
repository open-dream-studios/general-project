// import { BACKEND_URL } from "@/util/config";
// import { useState } from "react";

// const VideoDownload = () => {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [link, setLink] = useState<string>(
//     "https://www.youtube.com/watch?v=njX2bu-_Vw4"
//   );
//   const [start, setStart] = useState<string>("00:24");
//   const [end, setEnd] = useState<string>("00:40");

//   const handleDownload = async () => {
//     setLoading(true);

//     try {
//       const response = await fetch(`${BACKEND_URL}/create-video`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           link: link,
//           start: start,
//           end: end,
//         }),
//       });
//       const responseData = await response.json();
//       console.log(responseData);
//       if (response.status === 200) {
//         console.log("downloading");
//         window.open(`${BACKEND_URL}/download-video`, "_self");
//       }
//     } catch (error) {
//       console.error("Error downloading the video:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4 flex flex-col gap-[20px] pl-[30px] pt-[30px]">
//       <input
//         type="text"
//         value={link}
//         className="rounded-[4px] py-[3px] pl-[6px]"
//         style={{ border: "1px solid grey" }}
//         onChange={(e: any) => {
//           setLink(e.target.value);
//         }}
//       />
//       <input
//         type="text"
//         value={start}
//         className="rounded-[4px] py-[3px] pl-[6px]"
//         style={{ border: "1px solid grey" }}
//         onChange={(e: any) => {
//           setStart(e.target.value);
//         }}
//       />
//       <input
//         type="text"
//         value={end}
//         className="rounded-[4px] py-[3px] pl-[6px]"
//         style={{ border: "1px solid grey" }}
//         onChange={(e: any) => {
//           setEnd(e.target.value);
//         }}
//       />
//       <button
//         onClick={handleDownload}
//         className={`dim hover:brightness-75 cursor-pointer px-4 py-2 text-white rounded ${
//           loading ? "bg-gray-500" : "bg-[#1B3167]"
//         }`}
//         disabled={loading}
//       >
//         {loading ? "Downloading..." : "Download Video"}
//       </button>
//     </div>
//   );
// };

// export default VideoDownload;

import { BACKEND_URL } from "@/util/config";
import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { appTheme } from "@/util/appTheme";
import { AuthContext } from "@/contexts/authContext";

const VideoDownload = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [link, setLink] = useState<string>(
    "https://www.youtube.com/watch?v=njX2bu-_Vw4"
  );
  const [start, setStart] = useState<string>("00:24");
  const [end, setEnd] = useState<string>("00:40");

  const handleDownload = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/create-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, start, end }),
      });
      if (response.status === 200) {
        window.open(`${BACKEND_URL}/download-video`, "_self");
      }
    } catch (error) {
      console.error("Error downloading the video:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div
      className="flex justify-center items-center min-h-screen p-6 pb-[16vh]"
      style={{ backgroundColor: appTheme[currentUser.theme].background_1 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[600px] rounded-2xl shadow-xl p-8"
        style={{ backgroundColor: appTheme[currentUser.theme].background_1_2 }}
      >
        <div className="w-[100%] flex justify-center">
          <h1
            className="text-2xl font-bold mb-6 text-center flex flex-row gap-[9px]"
            style={{ color: appTheme[currentUser.theme].text_1 }}
          >
            <p>🎬</p>
            <p>Video Downloader</p>
          </h1>
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: appTheme[currentUser.theme].text_1 }}
          >
            Video Link
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            style={{
              border: `1px solid ${appTheme[currentUser.theme].text_3}`,
            }}
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: appTheme[currentUser.theme].text_1 }}
          >
            Start Time (mm:ss)
          </label>
          <input
            type="text"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            style={{
              border: `1px solid ${appTheme[currentUser.theme].text_3}`,
            }}
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: appTheme[currentUser.theme].text_1 }}
          >
            End Time (mm:ss)
          </label>
          <input
            type="text"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            style={{
              border: `1px solid ${appTheme[currentUser.theme].text_3}`,
            }}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={loading}
          className={`dim hover:brightness-75 cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white shadow-md transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Downloading..." : "Download Video"}
          {!loading && <Download size={18} />}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default VideoDownload;
