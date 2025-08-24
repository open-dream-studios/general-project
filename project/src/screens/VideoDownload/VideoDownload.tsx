import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { appTheme } from "@/util/appTheme";
import { AuthContext } from "@/contexts/authContext";
import { toast } from "react-toastify";
import { makeRequest } from "@/util/axios";
import { useAppContext } from "@/contexts/appContext";

const VideoDownload = () => {
  const { currentUser } = useContext(AuthContext);
  const { progressBar, progressType, setProgressBar, setProgressType, setProgressLoading, progressLoading } =
    useAppContext();
  const [link, setLink] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  const handleDownload = async () => {
    setProgressLoading(true);
    function validateTimeFormat(str: string): boolean {
      if (str === "") return true;
      const parts = str.split(":").map(Number);

      // Seconds only (S or SS)
      if (parts.length === 1) {
        const [s] = parts;
        return Number.isInteger(s) && s >= 0 && s < 60;
      }

      // MM:SS or M:SS
      if (parts.length === 2) {
        const [a, b] = parts;
        if (!Number.isInteger(a) || !Number.isInteger(b)) return false;
        return a >= 0 && a < 60 && b >= 0 && b < 60;
      }

      // HH:MM:SS or H:MM:SS
      if (parts.length === 3) {
        const [h, m, s] = parts;
        if (
          !Number.isInteger(h) ||
          !Number.isInteger(m) ||
          !Number.isInteger(s)
        )
          return false;
        return h >= 0 && m >= 0 && m < 60 && s >= 0 && s < 60;
      }
      return false;
    }

    try {
      const start_time = start.trim();
      const end_time = end.trim();
      if (!validateTimeFormat(start_time) || !validateTimeFormat(end_time)) {
        toast.error("Invalid timestamp format");
        return;
      }
      if (link.trim() === "") {
        toast.error("No link provided");
        return;
      }
      setProgressBar(0);
      setProgressType("video");

      await makeRequest.post(
        "/api/create-video",
        {
          link,
          start_time,
          end_time,
        },
        { timeout: 30 * 60 * 1000 }
      );
    } catch (error) {
      console.error("Error downloading the video:", error);
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
          disabled={progressLoading}
          className={`relative dim hover:brightness-75 cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white shadow-md transition ${
            progressLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {progressLoading ? `Downloading ${progressType}...` : "Download Video"}
          {!progressLoading && <Download size={18} />}

          {progressLoading && (
            <div className="absolute right-[18px] w-6 h-6 ml-2 flex items-center justify-center">
              <svg className="absolute 0" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeOpacity="0.4"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="butt"
                  strokeDasharray={2 * Math.PI * 16}
                  strokeDashoffset={
                    2 * Math.PI * 16 * (1 - (progressBar * 0.987) / 100)
                  }
                  transform="rotate(-90 18 18)"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default VideoDownload;
