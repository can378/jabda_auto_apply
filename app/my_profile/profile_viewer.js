document.addEventListener('DOMContentLoaded', async () => {
  const KEY = "jabda_auto_apply_data";
  const ta = document.getElementById("profileArea");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById('downloadBtn');

  // === default profile.json 로드 ===
  async function loadDefaultProfileText() {
    const res = await fetch(chrome.runtime.getURL("data/profile.json"));
    return await res.text();
  }
  async function loadDefaultProfileObj() {
    const txt = await loadDefaultProfileText();
    return JSON.parse(txt);
  }

  // === 원래 순서로 재배열 ===
  function orderWithTemplate(value, template) {
    if (Array.isArray(value) || typeof value !== "object" || value === null) return value;
    if (Array.isArray(template) || typeof template !== "object" || template === null) return value;

    const out = {};
    for (const k of Object.keys(template)) {
      if (k in value) out[k] = orderWithTemplate(value[k], template[k]);
    }
    for (const k of Object.keys(value)) {
      if (!(k in template)) out[k] = value[k];
    }
    return out;
  }

  function orderedStringifyByTemplate(obj, template) {
    if (!template || typeof obj !== "object" || obj === null) {
      try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
    }
    const ordered = orderWithTemplate(obj, template);
    return JSON.stringify(ordered, null, 2);
  }

  // === 프로필 불러오기 ===
  async function loadProfile() {
    try {
      const template = await loadDefaultProfileObj();
      const stored = await chrome.storage.sync.get(KEY);
      let data = stored?.[KEY];

      if (data === undefined) {
        await chrome.storage.sync.set({ [KEY]: template });
        ta.value = JSON.stringify(template, null, 2);
        return;
      }

      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch {}
      }

      if (typeof data === "object" && data !== null) {
        ta.value = orderedStringifyByTemplate(data, template);
      } else {
        ta.value = String(data);
      }
    } catch (e) {
      ta.value = `// 로드 실패: ${e?.message || e}`;
    }
  }

  // === 저장 ===
  saveBtn.addEventListener("click", async () => {
    try {
      const raw = ta.value.trim();
      const obj = JSON.parse(raw);
      await chrome.storage.sync.set({ [KEY]: obj });
      alert("저장 완료!");
    } catch (e) {
      alert(`저장 실패: ${e.message}`);
    }
  });

  // === 초기화 ===
  resetBtn.addEventListener("click", async () => {
    if (!confirm("기본 데이터로 초기화할까요?")) return;
    try {
      const def = await loadDefaultProfileObj();
      await chrome.storage.sync.set({ [KEY]: def });
      ta.value = JSON.stringify(def, null, 2);
      alert("기본 데이터로 복원되었습니다.");
    } catch (e) {
      alert(`초기화 실패: ${e.message}`);
    }
  });

  // === 복사 ===
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(ta.value);
      copyBtn.textContent = "copied!";
      setTimeout(() => (copyBtn.textContent = "copy"), 1500);
    } catch (e) {
      alert("복사 실패: " + e.message);
    }
  });
  
  
  // === 다운로드 ===
  downloadBtn.addEventListener("click", async () => {
    try {
      const raw = ta.value || "";
      let content = raw;
      let filename = "profile.json";
      let mime = "application/json;charset=utf-8";

      // JSON 형식이면 정렬해서 저장
      try {
        const obj = JSON.parse(raw);
        content = JSON.stringify(obj, null, 2);
      } catch {
        // JSON 아니면 txt로 저장
        filename = "profile.txt";
        mime = "text/plain;charset=utf-8";
        content = raw;
      }

      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      downloadBtn.textContent = "downloaded!";
      setTimeout(() => (downloadBtn.textContent = "download (.json)"), 1500);
    } catch (e) {
      alert("다운로드 실패: " + e.message);
    }
  });

  await loadProfile();
});
