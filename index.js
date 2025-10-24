import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// 🔹 ここで index.html と client.js を配信できるようにする
app.use(express.static(__dirname));

// 🔹 OpenAIクライアント
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    const prompt = `Translate the following text into ${targetLang}:\n${text}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ translation: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌙 Server running on port ${PORT}`));
