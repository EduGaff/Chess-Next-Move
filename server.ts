import express from "express";
import multer from "multer";
import cors from "cors";
import { Client } from "@gradio/client";
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

// Removed Gemini config
// Vision endpoint using external Hugging Face PyTorch ML API
app.post("/api/vision/fen", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const sideToMove = req.body.sideToMove || "w";

    // In Node 18+, we use the global Blob constructor directly for Gradio
    const fileBlob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });

    console.log("Connecting to Hugging Face Gradio Space...");
    const client = await Client.connect("salominavina/chessboard-recognizer");

    console.log("Predicting FEN via PyTorch CNN...");
    const result = await client.predict("/predict", {
      image: fileBlob,
    });

    // Gradio returns an object with a data array.
    const rawOutput = (result.data as any)[0] as string;

    if (!rawOutput) {
      throw new Error("No output received from Hugging Face API");
    }

    // The output is Markdown containing the FEN and Analysis Links.
    // Example: "Output FEN: **rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR** w KQkq..."
    // We strictly extract just the board state notation using Regex.
    const fenMatch = rawOutput.match(/([pnbrqkPNBRQK1-8]+\/){7}[pnbrqkPNBRQK1-8]+/);

    if (!fenMatch) {
      console.error("Gradio Raw Output:", rawOutput);
      throw new Error("Could not parse FEN from Hugging Face prediction");
    }

    const boardState = fenMatch[0];

    // Append the user's selected side to move and default castling/move numbers
    // This strictly ensures the Stockfish engine receives a valid and complete FEN
    const finalFen = `${boardState} ${sideToMove} KQkq - 0 1`;

    res.json({ fen: finalFen });
  } catch (error: any) {
    console.error("Vision Error:", error);
    res.status(500).json({ error: error.message || "Failed to process image via ML API" });
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
