// utils/loops.js
import { sleep,waitFor } from "./timer.js";


export function clickIfExists(sel, scope = document) {
  if (!sel) return false;
  const el = scope.querySelector(sel);
  if (!el) return false;
  el.click();
  return true;
}

// 데이터를 채울 i 번째 행 찾기 (ex) license[i].licenseName)
export function findRowContainer(i,target, scope=document,input=null) {
  const nameInput = input||scope.querySelector(`input[name="${target}[${i}].${target}Name"]`);
  if (!nameInput) return null;
  return (
    nameInput.closest('.row.in-span.no-margin') ||
    nameInput.closest('.wrapSubject') ||
    nameInput.closest('.row') ||
    nameInput.parentElement
  );
}


//=============================================================================
// 전공 행 찾기
export function findMajorRow(kind, i, mi, scope=document) {
  const target=`${kind}[${i}].collegeMajor[${mi}].majorName`;
  const input = scope.querySelector(`input[name="${target}"]`);
  return findRowContainer(i,kind,scope,input);
}

export async function ensureMajorRow(kind, i, mi, collegeRow) {
  const row = collegeRow;
  let majorRow = findMajorRow(kind, i, mi, row);
  if (majorRow) return majorRow;

  // 해당 대학 블록 안의 전공 루프 영역에서 +버튼 찾아 클릭
  const loopRoot = row.querySelector('.subject[data-wrap="major"] .row.loop[data-loop="collegeMajor"]') || row;

  const findAdd = () =>
    loopRoot.querySelector(`.wrapBtn [data-button="add"][data-rel-target="college[${i}]"]`) ||
    loopRoot.querySelector('.wrapBtn [data-button="add"]') ||
    loopRoot.querySelector('[data-button="add"]');

  for (let tries = 0; tries < 6; tries++) {
    const addBtn = findAdd();
    if (!addBtn) break;
    else addBtn.click();

    majorRow = await waitFor(() => findMajorRow(kind, i, mi, row), { timeout: 3000, interval: 80 });
    if (majorRow) return majorRow;
  }

  throw new Error(`${kind}[${i}].collegeMajor[${mi}] 행을 생성하지 못했습니다.`);
}


//=============================================================================

// 데이터를 채울 행 하나 찾거나 (없으면 + 클릭해서 생성)
export async function ensureRow(i, target) {
  let row = findRowContainer(i, target);
  if (row) return row;
  let maxClicks = 5;

  const loopRoot = document.querySelector(`.row.loop[data-loop="${target}"]`) || document;

  for (let tries = 0; tries < maxClicks; tries++) {
    const addBtn = loopRoot.querySelector('.wrapBtn [data-button="add"]');
    addBtn.click();

    // 클릭 후 대기
    try {
      await waitFor(() => findRowContainer(i,target), 5000, 80);
      row = findRowContainer(i,target);
      if (row) return row;
    } catch {}
    await sleep(150);
  }
  throw new Error(`${target}[${i}] 행을 생성하지 못했습니다.`);
}


/**
 * 원하는 개수만큼 미리 행 여러개 확보
 * @param {string} loopName       예: "license", "college", "graduateSchool"
 * @param {number} desiredCount   확보할 행 개수
 * @param {string} [rootSelector] 루트 컨테이너
 * @return {number} 최종 확보 개수
 */
export async function ensureLoop(loopName, desiredCount, rootSelector, addBtn=null)
{
  // find root sector
  const root = document.querySelector(rootSelector);
  if (!root) {
    console.warn(`❌ ensureLoop: root not found for ${loopName}`);
    return 0;
  }

  // 행 후보들
  const rowPatterns = [
    `.wrapSubject[data-loop="${loopName}"][data-index]`,
    `[data-loop="${loopName}"] .row.loop`, 
    `[data-loop="${loopName}"][data-index]`,
  ];
  
  const rows = () => {
    for (const pat of rowPatterns) {
      const n = root.querySelectorAll(pat).length;
      if (n > 0) return n;
    }
    const n= document.querySelectorAll(`[data-loop="${loopName}"] .row.loop, [data-loop="${loopName}"]`).length;
    if (n>0) return n;
    return 0;
  };

  let n = rows();
  let tries = 0;

  console.log(`ensureLoop2: ${loopName} to ${desiredCount}, now ${n}`);

  while (n < desiredCount && tries < 20) 
  {
    // + 버튼
    const clicked =
      clickIfExists(addBtn) ||
      clickIfExists(`[data-loop="${loopName}"] [data-button="add"]`, root) ||
      clickIfExists(`button[data-loopname="${loopName}"][data-button^="add"]`)||
      clickIfExists(`[data-loopname="${loopName}"][data-button^="add"]`, root) ||
      clickIfExists(`.wrapBtn [data-button="add"]`, root)||
      clickIfExists(`[data-loopname="${loopName}"][data-button^="add"]`)||
      clickIfExists(`[data-loop="${loopName}"] [data-button="add"]`);

    if (!clicked){
      console.warn("cant press add button"); 
      break;
    } 

    await sleep(100);
    const prev = n;
    n = rows();
    
    // 안전장치: 무한 루프 방지
    if (n === prev) { await sleep(200); }
    tries++;
  }

  return n;
}



