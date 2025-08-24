import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import https from "https";
import fs from "fs";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import { spawn } from "child_process";
import {
  getSheetData,
  updateRow,
  updateCell,
  getNotes,
  setNotes,
  SHEET_NAME,
  SHEET_ID,
  auth,
} from "./functions/google.js";
import imageRouter from "./routes/images.js";
import userRoutes from "./routes/users.js";
import { db } from "./connection/connect.js";
import { google } from "googleapis";
import path from "path";
import { BACKEND_URL } from "./config.js";
import { initializeWebSocket, getIO } from "./connection/websocket.js";
dotenv.config();

// const isProduction = process.env.NODE_ENV === "production";
const app = express();
const PORT = process.env.PORT || 8080;
const __dirname = new URL(".", import.meta.url).pathname;

const useHTTPS = false;
const server = useHTTPS
  ? (() => {
      try {
        return https.createServer(
          {
            key: fs.readFileSync("./ssl/key.pem"),
            cert: fs.readFileSync("./ssl/cert.pem"),
          },
          app
        );
      } catch (err) {
        console.error("⚠️ Failed to load SSL certs. Falling back to HTTP.");
        return http.createServer(app);
      }
    })()
  : http.createServer(app);

// App
app.use((req, res, next) => {
  if (req.headers.authorization) {
    req.accessToken = req.headers.authorization.split(" ")[1];
  }
  next();
});

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/images", imageRouter);

// Database
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed: ", err);
    return;
  }
  console.log("Connected to MySQL Database");
  connection.release();
});

// INVENTORY
app.get("/google/inventory", async (req, res) => {
  try {
    const data = await getSheetData();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/google/update-row", async (req, res) => {
  const { rowIndex, rowData } = req.body;
  try {
    await updateRow(rowIndex, rowData);
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/google/update", async (req, res) => {
  const { row, column, value } = req.body;
  try {
    await updateCell(row, column, value);
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/google/set-notes", async (req, res) => {
  const { row, value } = req.body;
  try {
    await setNotes(row, value);
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/google/get-notes", async (req, res) => {
  const { row } = req.body;
  try {
    const notes = await getNotes(row);
    res.json({ status: "success", notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const imagesColumn = "P";
const rowCount = 1000;

app.get("/wix-inventory", async (req, res) => {
  console.log("wix inventory");
  try {
    const authClient = await auth.getClient();
    console.log("got client");
    const sheets = google.sheets({ version: "v4", auth: authClient });
    console.log("got sheet");
    const [valuesRes, notesRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1:${imagesColumn}`,
        auth: authClient,
      }),
      sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID,
        ranges: [`${SHEET_NAME}!${imagesColumn}1:${imagesColumn}${rowCount}`],
        fields: "sheets.data.rowData.values.note",
        auth: authClient,
      }),
    ]);

    const rows = valuesRes.data.values || [];
    console.log(rows.length);
    const notesData = notesRes.data.sheets[0].data[0].rowData || [];
    console.log("NOTES", notesData.length);

    const headers = rows[0];
    const data = rows.slice(1).map((row, i) => {
      const product = {};
      headers.forEach((header, j) => {
        product[header] = row[j] || "";
      });

      const note = notesData[i + 1]?.values?.[0]?.note || "";
      const images = note
        .trim()
        .split(/\s+/)
        .filter((url) => url.startsWith("http"));
      product.Images = images;
      console.log("IMAGES", images);
      console.log("PRODUCT", product);
      return product;
    });
    console.log(data);

    res.json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

app.use("/temp", express.static(path.join(__dirname, "temp")));
app.post("/api/create-video", (req, res) => {
  const { link, start_time, end_time } = req.body;
  console.log("");
  console.log("Received ", link, start_time, end_time);

  if (!link) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const pythonProcess = spawn("python3", [
    "video.py",
    link,
    start_time,
    end_time,
  ]);

  pythonProcess.stdout.on("data", (data) => {
    const output = data.toString().trim();
    const [type, progressStr] = output.split(":");
    if (!isNaN(progressStr)) {
      const progress = parseFloat(progressStr);
      if (type.startsWith("video") || type.startsWith("audio")) {
        console.log(type, progress);
        getIO().emit("video-progress", { type, progress });
      }
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data.toString()}`);
  });

  let responded = false;
  pythonProcess.on("close", (code) => {
    console.log(`Python exited ${code}`);
    if (responded) return;
    responded = true;

    if (code === 0) {
      res
        .status(200)
        .json({ downloadUrl: `${BACKEND_URL}/api/download-video` });
      getIO().emit("video-complete", {
        success: true,
        downloadUrl: `${BACKEND_URL}/api/download-video`,
      });
    } else {
      res.status(500).json({ error: "Video processing failed" });
      getIO().emit("video-complete", { success: false, downloadUrl: null });
    }
  });
});

app.get("/api/download-video", (req, res) => {
  console.log("download");
  const filePath = path.join(__dirname, "temp", "clip.mp4");
  res.download(filePath, "clip.mp4", (err) => {
    if (err && !res.headersSent) {
      console.error("Error downloading the file:", err);
      res.status(500).send("Error downloading the file.");
    }
  });
});

// Process signals for web socket
const io = initializeWebSocket(server);
const shutdown = () => {
  console.log("Shutting down server...");
  io.sockets.sockets.forEach((socket) => {
    socket.disconnect(true);
  });
  io.close(() => {
    console.log("WebSocket server closed.");
  });
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(PORT, () => {
  console.log("API is running on port " + PORT);
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.get("/api/*", (req, res) => {
  res.status(404).json("Page does not exist!");
});
