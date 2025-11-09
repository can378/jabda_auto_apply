import { setValue, unlockGroup} from "./dom.js";
import { runSearchAndPickFirst } from "./search.js";
import { ensureLoop,ensureMajorRow} from "./loops.js";


function getRow(kind, i) {
  return document.querySelector(`.wrapSubject[data-loop="${kind}"][data-index="${i}"]`) || document;
}

// =========================================================
// SEARCH
// =========================================================
export async function searchHighschool(keyword) {
  const row = getRow('highschool', 0);
  const input = row.querySelector('input[type="search"][data-type="highschool"]')
            || document.querySelector('input[type="search"][data-type="highschool"]');
  return runSearchAndPickFirst(row, keyword, input);
}

export async function searchCollege(kind, i, keyword) {
  const row = getRow(kind, i);
  let input = row.querySelector('input[type="search"][data-type="college"]')
           || document.querySelector(`input[type="search"][data-type="college"][data-rel-target="${kind}[${i}]"]`);
  return runSearchAndPickFirst(row, keyword, input);
}

export async function searchMajor(kind, i, keyword, opts = {}) {
  const { mi = null, root = null, inputEl = null } = opts;

  // 해당 학교 행
  const row = root || await getRow(kind, i);

  let input = inputEl;
  if (!input) {
    if (mi != null) {
      // search input 찾기
      const hidden = row.querySelector(`input[name="${kind}[${i}].collegeMajor[${mi}].majorName"]`);
      const mscope = hidden
        ? (hidden.closest('.search') || hidden.closest('.row') || row)
        : row;
      input = mscope.querySelector(`input[type="search"][data-type="major"]`);
    } else {
      // 단일 전공 처리
      input =
        row.querySelector(`input[type="search"][data-type="major"][data-rel-target="${kind}[${i}]"]`) ||
        row.querySelector(`input[type="search"][data-type="major"]`);
    }
  }

  const scope = input?.closest('.search') || row;
  return runSearchAndPickFirst(scope, keyword, input);
}


// =========================================================
// INPUT
// =========================================================
//1) 고등학교
export async function fillHighschool(h) {
  setValue(document.querySelector('input[type="radio"][name="highschool.graduationTypeCode"]'), h.graduationTypeCode);
  await searchHighschool(h.academyName);

  setValue(document.querySelector('input[name="highschool.academyName"]'), h.academyName);
  setValue(document.querySelector('select[name="highschool.locationCode"]'), h.locationCode);
  setValue(document.querySelector('select[name="highschool.highschoolCategoryCode"]'), h.highschoolCategoryCode);
  setValue(document.querySelector('input[type="radio"][name="highschool.dayOrNight"]'), h.dayOrNight);
  setValue(document.querySelector('input[name="highschool.entranceDate"]'), h.entranceDate);
  setValue(document.querySelector('input[name="highschool.graduationDate"]'), h.graduationDate);
}


// ------------------------------------------------------------------


// 2) 대학/대학원 공통
async function fillCollegeRow(kind, i, c) {
  const row = await getRow(kind, i);
  await searchCollege(kind, i, c.academyName);

  setValue(row.querySelector(`input[type="radio"][name="${kind}[${i}].degreeTypeCode"]`), c.degreeTypeCode);
  setValue(row.querySelector(`select[name="${kind}[${i}].locationCode"]`), c.locationCode);
  setValue(row.querySelector(`input[type="radio"][name="college[${i}].headOrBranch"]`), c.headOrBranch);

  setValue(row.querySelector(`input[name="graduateSchool[${i}].academicAdviser"]`), c.academicAdviser);
  setValue(row.querySelector(`input[name="graduateSchool[${i}].lab"]`), c.lab);

  setValue(row.querySelector(`input[type="radio"][name="college[${i}].entranceTypeCode"]`), c.entranceTypeCode);
  setValue(row.querySelector(`input[type="radio"][name="${kind}[${i}].graduationTypeCode"]`), c.graduationTypeCode);

  setValue(row.querySelector(`input[name="${kind}[${i}].entranceDate"]`), c.entranceDate);
  setValue(row.querySelector(`input[name="${kind}[${i}].graduationDate"]`), c.graduationDate);
  setValue(row.querySelector(`select[name="${kind}[${i}].collegeCategoryCode"]`), c.collegeCategoryCode);
  setValue(row.querySelector(`input[name="${kind}[${i}].score"]`), c.score);
  setValue(row.querySelector(`select[name="${kind}[${i}].perfectScore"]`), c.perfectScore);
  setValue(row.querySelector(`input[name="${kind}[${i}].majorCredits"]`), c.majorCredits);
  setValue(row.querySelector(`input[name="${kind}[${i}].majorAverageScore"]`), c.majorAverageScore);
  setValue(row.querySelector(`select[name="${kind}[${i}].majorPerfectScore"]`), c.majorPerfectScore);

  // --- 전공 ---
  const majors = Array.isArray(c.major) ? c.major : (c.major ? [c.major] : []);
  for (let mi = 0; mi < majors.length; mi++) {
    const m = majors[mi] || {};
    
    await ensureMajorRow(kind, i, mi, row);
    await searchMajor(kind, i, m.majorName, { mi, root: row });
    unlockGroup(`${kind}[${i}].collegeMajor[${mi}]`);

    setValue(row.querySelector(`input[type="radio"][name="${kind}[${i}].collegeMajor[${mi}].majorTypeCode"]`), m.majorTypeCode);
    setValue(row.querySelector(`select[name="${kind}[${i}].collegeMajor[${mi}].majorCategoryCode"]`), m.majorCategoryCode);
    setValue(row.querySelector(`input[type="radio"][name="${kind}[${i}].collegeMajor[${mi}].dayOrNight"]`), m.dayOrNight);
  }
}


// 대학
export async function fillCollege(colleges = []) {

  await ensureLoop(
    "college",
    colleges.length,
    `.wrapCollege[data-wrap="collegeLoop"][data-type="college"]`,
    '[data-loopname="college"][data-button="addCollege"]'
  );

  for (let i = 0; i < colleges.length; i++) await fillCollegeRow('college', i, colleges[i]);
}

//대학원
export async function fillGraduate(grads = []) {

  await ensureLoop(
    "graduateSchool",
    grads.length,
    `.wrapCollege[data-wrap="collegeLoop"][data-type="graduateSchool"]`,
    '[data-loopname="graduateSchool"][data-button="addCollege"]'
  );
  for (let i = 0; i < grads.length; i++) await fillCollegeRow('graduateSchool', i, grads[i]);
}



//3) 논문 등등...
export function fillResearchToggles(paper, researchPaper, researchPresent, researchInvolve) {
  const pairs = [
    { name: 'paper.existYn', v: paper?.existYn },
    { name: 'researchPaper.existYn', v: researchPaper?.existYn },
    { name: 'researchPresent.existYn', v: researchPresent?.existYn },
    { name: 'researchInvolve.existYn', v: researchInvolve?.existYn }
  ];
  for (const { name, v } of pairs) {
    const el = document.querySelector(`input[name="${name}"][value="${v}"]`);
    if (el) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); }
  }
}

//4) 경력
export async function fillCareer(careers = []) {
  await ensureLoop("career", careers.length,'.subject[data-wrap="career"][data-type="career"]');

  for (let i = 0; i < careers.length; i++) {
    const c = careers[i];
    setValue(document.querySelector(`select[name="career[${i}].careerCriteriaCodeSn"]`), c.careerCriteriaCodeSn);
    setValue(document.querySelector(`input[name="career[${i}].company"]`), c.company);
    setValue(document.querySelector(`input[type="radio"][name="career[${i}].workingStatusCode"]`), c.workingStatusCode);
    setValue(document.querySelector(`input[name="career[${i}].entranceDate"]`), c.entranceDate);
    setValue(document.querySelector(`input[name="career[${i}].leavingDate"]`), c.leavingDate);
    setValue(document.querySelector(`input[name="career[${i}].department"]`), c.department);
    setValue(document.querySelector(`input[name="career[${i}].position"]`), c.position);
    setValue(document.querySelector(`input[name="career[${i}].assignedTask"]`), c.assignedTask);
    setValue(document.querySelector(`input[name="career[${i}].salary"]`), c.salary);
    setValue(document.querySelector(`input[name="career[${i}].retirementReason"]`), c.retirementReason);
  }
}

//5) 프로젝트
export async function fillProject(projects = []) {
  await ensureLoop("project", projects.length, '.subject[data-wrap="project"][data-type="project"]');

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    setValue(document.querySelector(`input[name="project[${i}].projectName"]`), p.projectName);
    setValue(document.querySelector(`input[name="project[${i}].clientName"]`), p.clientName);
    setValue(document.querySelector(`input[name="project[${i}].workplace"]`), p.workplace);
    setValue(document.querySelector(`input[name="project[${i}].startDate"]`), p.startDate);
    setValue(document.querySelector(`input[name="project[${i}].endDate"]`), p.endDate);
    setValue(document.querySelector(`input[name="project[${i}].contributionRate"]`), p.contributionRate);
    setValue(document.querySelector(`input[name="project[${i}].role"]`), p.role);
  }
}

// 6) 추가경험
async function fillExtraExperience(data) {
  if (data == null) return;

  const ta = document.querySelector(`textarea[name="experienceBuilder.textInput"]`);
  if (!ta) return;
  ta.value = data;
}






export async function fillAll(profile) {
  await fillHighschool(profile.highschool);
  await fillCollege(profile.college);
  await fillGraduate(profile.graduateSchool);
  fillResearchToggles(profile.paper, profile.researchPaper, profile.researchPresent, profile.researchInvolve);
  await fillCareer(profile.career);
  await fillProject(profile.project);
  await fillExtraExperience(profile.extraExperience)
  console.log('fillAll2 완료');
}