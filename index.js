import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🌙 Realtime Translate Server connected to OpenAI!");
});

app.post("/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    const prompt = `Translate the following text into ${targetLang}:\n${text}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const translation = completion.choices[0].message.content;
    res.json({ translation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
