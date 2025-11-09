/////////////////////////////////////
// 현재 html 정보 획득
/////////////////////////////////////
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("활성 탭 없음");
  return tab;
}

// 실행
async function runAutoFill(type) {
  const tab = await getActiveTab();
  const res = await chrome.tabs.sendMessage(tab.id, { type });
  alert(`${type} 실행 완료 (${res?.filled ?? 0})`);
}


/////////////////////////////////////
// 프로필 데이터
/////////////////////////////////////
async function getProfile() 
{
  const { __profile_override__ } = await chrome.storage.local.get("__profile_override__");

  if (typeof __profile_override__ === "string") 
  {
    try 
    {
      const parsed = JSON.parse(__profile_override__);
      return { source: "override", data: parsed };
    } 
    catch (e) 
    {
      console.warn("Failed to parse profile data-getProfile", e);
      return { source: "override", data: null };
    }
  }
  return { source: null, data: null };
}

async function checkMyProfile() {
  try {
    const { source, data } = await getProfile();

    // 1) 데이터 보관
    const payloadKey = "__profile_view_payload__";
    await chrome.storage.local.set({ [payloadKey]: { source, data, ts: Date.now() } });

    // 2) 팝업 새 창 열기
    chrome.windows.create({
      url: chrome.runtime.getURL("my_profile/profile_viewer.html"),
      type: "popup",
      width: 900,
      height: 900,
      left: 120,
      top: 120,
      focused: true
    });
  } catch (e) {
    console.error("check Profile Data: failed", e);
  }
}


/////////////////////////////////////
// 버튼 연결
/////////////////////////////////////
document.getElementById("my_profile").addEventListener("click", checkMyProfile);
document.getElementById("auto_fill_step1").addEventListener("click", () => runAutoFill("RUN_AUTOFILL_1"));
document.getElementById("auto_fill_step2").addEventListener("click", () => runAutoFill("RUN_AUTOFILL_2"));
document.getElementById("auto_fill_step3").addEventListener("click", () => runAutoFill("RUN_AUTOFILL_3"));
