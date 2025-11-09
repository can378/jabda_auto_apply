import { sleep } from "./timer.js";
import { setValue,unlockGroup } from "./dom.js";
import { runSearchAndPickFirst } from "./search.js";
import { ensureLoop, ensureRow } from "./loops.js";

// 1) 공인외국어시험
async function fillLanguageExams(data) {
  if (!Array.isArray(data?.languageExam)) return;

  for (let i = 0; i < data.languageExam.length; i++) {
    const x = data.languageExam[i];

    const row=await ensureRow(i,"languageExam");
    await runSearchAndPickFirst(row, x.languageExamName);

    await sleep(300);

    const d = x.detail || {};
    setValue(document.querySelector(`input[name="languageExam[${i}].registNumber"]`), d.registNumber ?? "");
    setValue(document.querySelector(`input[name="languageExam[${i}].examDate"]`), d.examDate ?? "");
    setValue(document.querySelector(`input[name="languageExam[${i}].score"]`), d.score ?? "");
    setValue(document.querySelector(`input[name="languageExam[${i}].perfectScore"]`), d.perfectScore ?? "");
    setValue(document.querySelector(`select[name="languageExam[${i}].gradeCode"]`), d.gradeCode ?? "");
  }
}


// 1-2) 외국어활용능력
async function fillLanguageSkills(data) {
  if (!Array.isArray(data?.languageSkill)) return;

  await ensureLoop("languageSkill",data.languageSkill.length,'.subject[data-type="languageSkill"]');

  for (let i = 0; i < data.languageSkill.length; i++) {
    const s = data.languageSkill[i];

    // 외국어 선택
    setValue(document.querySelector(`select[name="languageSkill[${i}].languageCode"]`), s.languageCode);

    // 수준 선택
    setValue(document.querySelector(`select[name="languageSkill[${i}].speakingLevelCodeSn"]`), s.speakingLevelCodeSn);
    setValue(document.querySelector(`select[name="languageSkill[${i}].writingLevelCodeSn"]`),s.writingLevelCodeSn);
    setValue(document.querySelector(`select[name="languageSkill[${i}].readingLevelCodeSn"]`),s.readingLevelCodeSn);
  }
}




// 2) 자격증
async function fillLicense(data) {
  if (!data?.license || !Array.isArray(data.license)) return;
  for (let i=0; i < data.license.length; i++)
  {
    const l= data.license[i];

    const row = await ensureRow(i,"license");
    await runSearchAndPickFirst(row, l.licenseName);

    setValue(document.querySelector(`input[name="license[${i}].organization"]`), l.organization ?? "");
    setValue(document.querySelector(`input[name="license[${i}].registNumber"]`), l.registNumber ?? "");
    setValue(document.querySelector(`input[name="license[${i}].acquireDate"]`), l.acquireDate ?? "");

    unlockGroup(`license[${i}]`);
  }
}



// 3) 수상경력
async function fillAwards(data) {
  if (!Array.isArray(data?.award)) return;

  for (let i = 0; i < data.award.length; i++) {
    const A = data.award[i];
    await ensureRow(i,"award");

    setValue(document.querySelector(`input[name="award[${i}].awardName"]`), A.awardName);
    setValue(document.querySelector(`input[name="award[${i}].organization"]`), A.organization);
    setValue(document.querySelector(`input[name="award[${i}].awardDate"]`), A.awardDate);
    setValue(document.querySelector(`input[name="award[${i}].comment"]`), A.comment);
  }
}


// 4) 교육이수사항
async function fillEducations(data) {
  if (!Array.isArray(data?.education)) return;

  for (let i = 0; i < data.education.length; i++) {
    const E = data.education[i];
    await ensureRow(i,"education");

    setValue(document.querySelector(`input[name="education[${i}].educationName"]`), E.educationName);
    setValue(document.querySelector(`input[name="education[${i}].organization"]`), E.organization);
    setValue(document.querySelector(`input[name="education[${i}].startDate"]`), E.startDate);
    setValue(document.querySelector(`input[name="education[${i}].endDate"]`), E.endDate);
    setValue(document.querySelector(`input[name="education[${i}].time"]`), E.time);
    setValue(document.querySelector(`input[name="education[${i}].comment"]`), E.comment);
  }
}


// 5) 학내외 활동
async function fillActivities(data) {
  if (!Array.isArray(data?.activity)) return;

  await ensureLoop(
    "activity",
    data.activity.length,
    '.subject[data-wrap="activity"][data-type="activity"]'
  );

  for (let i = 0; i < data.activity.length; i++) {
    const ac = data.activity[i];

    setValue(document.querySelector(`select[name="activity[${i}].activityCategorySn"]`),ac.activityCategorySn);

    unlockGroup(`activity[${i}]`);

    setValue(document.querySelector(`input[name="activity[${i}].startDate"]`), ac.startDate);
    setValue(document.querySelector(`input[name="activity[${i}].endDate"]`), ac.endDate);
    setValue(document.querySelector(`input[name="activity[${i}].role"]`), ac.role);
    setValue(document.querySelector(`input[name="activity[${i}].contents"]`), ac.contents);
  }
}


// 6) 추가질문
async function fillEtcBuilder(data) {
  if (data?.etcBuilder?.textInput == null) return;
  const ta = document.querySelector(`textarea[name="etcBuilder[0].textInput"]`);
  if (!ta) return;
  ta.value = data.etcBuilder.textInput;
  ta.dispatchEvent(new Event("input", { bubbles: true }));
  ta.dispatchEvent(new Event("change", { bubbles: true }));
}







export async function fillAll(profile) {
  await fillLanguageExams(profile);
  await fillLanguageSkills(profile)
  await fillLicense(profile);
  await fillAwards(profile);
  await fillEducations(profile);
  await fillActivities(profile);
  await fillEtcBuilder(profile);
  console.log("fillAll3 완료");
}
