// 要素参照
const micBtn = document.getElementById("micBtn");
const state = document.getElementById("state");
const sourceSel = document.getElementById("sourceLang");
const targetSel = document.getElementById("targetLang");
const interimEl = document.getElementById("interim");
const finalEl = document.getElementById("final");
const liveTransEl = document.getElementById("liveTrans");
const bestTransEl = document.getElementById("bestTrans");
const manualInput = document.getElementById("manualInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

// ユーティリティ
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function translate(text, targetLang) {
  const res = await fetch("/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang })
  });
  const data = await res.json();
  return data.translation || "";
}

// 手入力送信
sendBtn.addEventListener("click", async () => {
  const text = manualInput.value.trim();
  if (!text) return;
  interimEl.textContent = "";
  finalEl.textContent = text;
  liveTransEl.textContent = "⏳ 翻訳中...";
  bestTransEl.textContent = "";

  const t1 = await translate(text, targetSel.value);
  liveTransEl.textContent = t1;
  bestTransEl.textContent = t1;
});

// クリア
clearBtn.addEventListener("click", () => {
  interimEl.textContent = "";
  finalEl.textContent = "";
  liveTransEl.textContent = "";
  bestTransEl.textContent = "";
  manualInput.value = "";
});

// 音声認識（Web Speech API）
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
let recognizing = false;
let lastFinalText = "";

// 音声ON/OFF
micBtn.addEventListener("click", async () => {
  if (!SR) {
    alert("このブラウザは音声認識に対応していません（Chrome/Edge推奨）");
    return;
  }
  if (!recognizing) {
    startRec();
  } else {
    stopRec();
  }
});

function startRec() {
  if (recognizing) return;
  rec = new SR();
  rec.lang = sourceSel.value;          // ja-JP / zh-TW / en-US / ko-KR
  rec.continuous = true;
  rec.interimResults = true;

  rec.onstart = () => {
    recognizing = true;
    micBtn.classList.add("on");
    micBtn.textContent = "🎙️ 音声入力 ON";
    state.textContent = "認識中...";
  };

  rec.onerror = (e) => {
    state.textContent = "エラー: " + e.error;
  };

  rec.onend = async () => {
    recognizing = false;
    micBtn.classList.remove("on");
    micBtn.textContent = "🎙️ 音声入力 OFF";
    state.textContent = "停止中";
    // 自動再開（意図的停止でなければ）
    await sleep(300);
  };

  rec.onresult = async (ev) => {
    let interim = "";
    let final = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const chunk = ev.results[i][0].transcript;
      if (ev.results[i].isFinal) final += chunk;
      else interim += chunk;
    }
    // 小さく入力表示
    interimEl.textContent = interim;
    if (final) lastFinalText += (lastFinalText ? " " : "") + final;
    finalEl.textContent = lastFinalText;

    // 軽量の同時翻訳（小さく表示）
    if (interim) {
      translate(interim, targetSel.value).then(t => {
        if (interim) liveTransEl.textContent = t;
      });
    }
    // 確定ごとに大きい補完翻訳
    if (final) {
      const t = await translate(lastFinalText, targetSel.value);
      bestTransEl.textContent = t;
    }
  };

  try { rec.start(); } catch (_) {}
}

function stopRec() {
  if (!rec) return;
  try { rec.stop(); } catch (_) {}
  recognizing = false;
  micBtn.classList.remove("on");
  micBtn.textContent = "🎙️ 音声入力 OFF";
  state.textContent = "停止中";
}
