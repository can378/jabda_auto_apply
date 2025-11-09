// utils/search.js
import { waitFor, sleep } from "./timer.js";
import { setValue } from "./dom.js";

// 검색 → 첫 결과 클릭
export async function runSearchAndPickFirst(codeSection, keyword, input = null) {
  const searchInput = input || codeSection.querySelector('input[type="search"]');
  if (!searchInput) throw new Error('검색 input을 찾지 못함');
  
  setValue(searchInput, keyword);

  const ev = { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 };
  searchInput.dispatchEvent(new KeyboardEvent('keydown', ev));
  searchInput.dispatchEvent(new KeyboardEvent('keypress', ev));
  searchInput.dispatchEvent(new KeyboardEvent('keyup', ev));

  // 첫 번째 버튼이 보일 때까지 대기
  const firstBtn = await waitFor(() => {
    const scope =
      codeSection.querySelector('.searchResultList') ||
      document.querySelector('.searchResultList');
    if (!scope) return null;

    // 첫 번째 선택지
    const btn = [...scope.querySelectorAll('li > button')]
      .find(el => el && getComputedStyle(el).display !== 'none' && el.offsetParent !== null);

    console.log(keyword,"========",scope,",",btn);

    return btn || null;
  }, 7000, 60);

  sleep(100);
  
  // 첫 항목 선택
  firstBtn.click();
  await sleep(150);
}
