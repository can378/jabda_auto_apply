import { sleep } from "./timer.js";
import { setValue} from "./dom.js";


// 1) 기본정보/연봉/국적
function fillBasic(profile) {
  setValue(document.querySelector('input[name="englishName"]'), profile.englishName);
  setValue(document.querySelector('input[name="birthday"]'), profile.birthday);

  setValue(document.querySelector(`input[type="radio"][name="genderFlag"]`), profile.genderFlag);
  
  setValue(document.querySelector('input[name="hopeSalary"]'), profile.hopeSalary);
  setValue(document.querySelector('input[name="latestSalary"]'), profile.latestSalary);

  setValue(document.querySelector('select[name="nationality"]'), profile.nationality);
}


// 2) 주소
async function fillAddressDirect(data, prefix) {
  if (!data) return false;
  
  setValue(document.querySelector(`input[name="${prefix}.zipCode"]`), data.zipCode ?? "");
  setValue(document.querySelector(`input[name="${prefix}.address"]`), data.address ?? "");
  setValue(document.querySelector(`input[name="${prefix}.detailAddress"]`), data.detailAddress ?? "");

  // 우편번호 표시
  const postSpan = document.querySelector(`.postCode[data-type="${prefix}"][data-span="postcode"]`);
  if (postSpan) postSpan.textContent = String(data.zipCode);

  await sleep(80);
}


// 3) 장애
function fillHandicap(h) {
  if (!h) return;
  setValue(document.querySelector('input[type="radio"][name="handicap.handicapYn"]'), h.handicapYn);
  setValue(document.querySelector('select[name="handicap.handicapGradeCode"]'), h.handicapGradeCode);
  setValue(document.querySelector('select[name="handicap.handicapContentsCode"]'), h.handicapContentsCode);
}


// 4) 보훈
function fillPatriot(pt) {
  if (!pt) return;
  setValue(document.querySelector('input[type="radio"][name="patriot.patriotYn"]'), pt.patriotYn);
  setValue(document.querySelector('input[name="patriot.patriotNumber"]'), pt.patriotNumber);
  setValue(document.querySelector('input[name="patriot.relationship"]'), pt.relationship);
  setValue(document.querySelector('select[name="patriot.patriotRate"]'), pt.patriotRate);
}


// 5) 병역
async function fillMilitary(m) {
  if (!m) return;
  setValue(document.querySelector('input[type="radio"][name="military.militaryTypeCode"]'), m.militaryTypeCode);
  setValue(document.querySelector('select[name="military.militaryBranchCode"]'), m.militaryBranchCode);
  setValue(document.querySelector('input[name="military.militaryRole"]'), m.militaryRole);
  setValue(document.querySelector('select[name="military.militaryPositionCode"]'), m.militaryPositionCode);
  setValue(document.querySelector('input[name="military.militaryStartDate"]'), m.militaryStartDate);
  setValue(document.querySelector('input[name="military.militaryEndDate"]'), m.militaryEndDate);
  setValue(document.querySelector('select[name="military.militaryDischargeCode"]'), m.militaryDischargeCode);
  setValue(document.querySelector('input[name="military.dischargeReason"]'), m.dischargeReason??"");
}


export async function fillAll(profile) {
  fillBasic(profile);
  await fillAddressDirect(profile.currentAddress, "currentAddress");
  await fillAddressDirect(profile.parentAddress,  "parentAddress");
  await fillAddressDirect(profile.residentAddress, "residentAddress");
  fillHandicap(profile.handicap);
  fillPatriot(profile.patriot);
  fillMilitary(profile.military);
  console.log("fillAll1 완료");
}
