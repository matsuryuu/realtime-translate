const input = document.getElementById("input");
const btn = document.getElementById("translateBtn");
const output = document.getElementById("output");
const targetLang = document.getElementById("targetLang");

btn.addEventListener("click", async () => {
  output.textContent = "⏳ 翻訳中...";
  const text = input.value.trim();
  if (!text) {
    output.textContent = "⚠️ 入力してください";
    return;
  }

  try {
    const response = await fetch("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        targetLang: targetLang.value,
      }),
    });

    const data = await response.json();
    if (data.translation) {
      output.textContent = data.translation;
    } else {
      output.textContent = "⚠️ 翻訳失敗: " + JSON.stringify(data);
    }
  } catch (err) {
    output.textContent = "❌ エラー: " + err.message;
  }
});
