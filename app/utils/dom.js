// utils/dom.js
export function setValue(el, value) {
  if (!el) return false;

  const tag  = el.tagName?.toLowerCase?.() || "";
  const type = (el.getAttribute?.("type") || "").toLowerCase();

  const wasReadonly = el.hasAttribute?.("readonly");
  const wasDisabled = !!el.disabled;

  // 잠금 해제
  if (wasReadonly) el.removeAttribute("readonly");
  if (wasDisabled) el.disabled = false;

  let changed = false;

  try {
    if (tag === "select") 
    {
      changed = setSelectValue(el, value);
    } 
    else if (type === "radio") 
    {
      return setRadioValue(el.name, value);
    } 
    else if (type === "checkbox") 
    {
      const next = !!value;
      if (el.checked !== next) {
        try { el.click(); }
        catch { el.checked = next; changed = true; }
      }
    } 
    else if (type === "number") 
    {
      const v = String(value ?? "").replace(/[^\d.-]/g, "");
      if (el.value !== v) { el.value = v; changed = true; }
    } 
    else 
    {
      const v = value ?? "";
      if (el.value !== v) { el.value = v; changed = true; }
    }

    // 공통 이벤트
    el.dispatchEvent(new Event("input",  { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur",   { bubbles: true }));

    return true;
  } 
  finally {
    // 원상 복구
    if (wasReadonly) el.setAttribute?.("readonly", "");
    if (wasDisabled) el.disabled = true;
  }
}

export function setRadioValue(name, value) {
  const esc = (window.CSS && CSS.escape)
    ? CSS.escape
    : (s) => String(s).replace(/"/g, '\\"');

  const sel = `input[type="radio"][name="${esc(name)}"][value="${esc(value)}"]`;
  const el = document.querySelector(sel);
  
  if (!el) return false;
  if (el.disabled) { try { el.disabled = false; } catch {} }
  if (!el.disabled) {
    try { el.click(); return true; } catch {}
  }

  // 클릭 실패 시 fallback
  el.checked = true;
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

export function setSelectValue(selectEl, value) {
  if (!selectEl) return false;
  if (value == null || value === "") return false;

  const opts = Array.from(selectEl.options);
  const opt =
    opts.find(o => o.value == value) ||
    opts.find(o => o.text.trim() === String(value).trim());

  if (!opt) return false;

  if (selectEl.value !== opt.value) {
    selectEl.value = opt.value;
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
  }
  return true;
}



// 잠금 해제 (readonly, disabled)
export function unlockGroup(groupId) {
  document.querySelectorAll(`[data-rel-target="${groupId}"]`).forEach(el => {
    if (el.hasAttribute("disabled")) el.removeAttribute("disabled");
  });
}