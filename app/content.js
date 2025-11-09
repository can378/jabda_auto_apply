// content.js
(async () => {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    (async () => {
      try {
        const KEY = "jabda_auto_apply_data";
        let profile = null;

        //data===========================================================
        const stored = await chrome.storage.sync.get(KEY);
        if (stored && stored[KEY]) {
          try {
            profile = typeof stored[KEY] === "string" ? JSON.parse(stored[KEY]) : stored[KEY];
            console.log("[AutoFill] Loaded profile from chrome.storage.sync");
          } catch (e) {
            console.warn("[AutoFill] Failed to parse stored profile:", e);
          }
        }

        if (!profile) {
          const res = await fetch(chrome.runtime.getURL("data/profile.json"));
          profile = await res.json();
          console.log("[AutoFill] Loaded default profile.json");
        }

        // 자동입력 실행====================================================
        if (msg?.type === "RUN_AUTOFILL_1") {
          const mod1 = await import(chrome.runtime.getURL("utils/autoFill1.js"));
          await mod1.fillAll(profile);
        }
        else if (msg?.type === "RUN_AUTOFILL_2") {
          const mod2 = await import(chrome.runtime.getURL("utils/autoFill2.js"));
          await mod2.fillAll(profile);
        }
        else if (msg?.type === "RUN_AUTOFILL_3") {
          const mod3 = await import(chrome.runtime.getURL("utils/autoFill3.js"));
          await mod3.fillAll(profile);
        }

        sendResponse({ ok: true });
      } catch (e) {
        console.warn("[fillForm ERROR]", e);
        sendResponse({ ok: false, error: e.message });
      }
    })();

    return true; // keep async listener alive
  });
})();
