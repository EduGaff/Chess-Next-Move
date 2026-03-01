import express from "express";
import multer from "multer";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fs.writeFileSync("server.log", "Server script starting at " + new Date().toISOString() + "\n");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

const upload = multer({ storage: multer.memoryStorage() });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Vision endpoint using internal Python Microservice
app.post("/api/vision/fen", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const sideToMove = req.body.sideToMove || "w";

    const formData = new FormData();
    // In Node 18+, we use the global Blob constructor directly
    const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('image', fileBlob, 'board.png');
    formData.append('sideToMove', sideToMove);

    const response = await fetch('http://127.0.0.1:5000/process', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python Vision Service Error:", errorText);
      throw new Error(`Vision Service failed with status ${response.status}`);
    }

    const data = await response.json();
    const fen = data.fen?.trim();

    if (!fen) {
      throw new Error("Could not detect FEN from image");
    }

    res.json({ fen });
  } catch (error: any) {
    console.error("Vision Error:", error);
    res.status(500).json({ error: error.message || "Failed to process image" });
  }
});

async function startServer() {
  fs.appendFileSync("server.log", "startServer called\n");
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        root: process.cwd(),
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      fs.appendFileSync("server.log", "Vite middleware added\n");
    } catch (e: any) {
      fs.appendFileSync("server.log", "Error creating Vite server: " + e.message + "\n");
    }
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    fs.appendFileSync("server.log", `Server listening on port ${PORT}\n`);
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
