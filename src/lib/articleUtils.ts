// ✅ src/lib/articleUtils.ts
import { nanoid } from "nanoid";

/** 연예인 느낌이 거의 없는, 흔한 한국 이름 30개 */
const genericKoreanNames = [
  "김서현", "이주호", "박선영", "정도현", "최유림",
  "강민재", "오경아", "한도윤", "윤하준", "조윤아",
  "임태현", "신수빈", "권민지", "배지호", "노서연",
  "송지훈", "문예지", "전우성", "홍수아", "백지훈",
  "서유진", "양도현", "유서연", "남승현", "황예준",
  "표지은", "구도연", "진우석", "채민아", "마태준"
];

export function makeSlug(title: string, dateISO: string, id: string) {
  return title
    .toLowerCase()
    .replace(/[^가-힣a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    + "-" + dateISO.replace(/-/g, "")
    + "-" + id;
}

export function randomReporter() {
  return genericKoreanNames[
    Math.floor(Math.random() * genericKoreanNames.length)
  ];
}

export function createDummyArticle(idx = 0) {
  const id = nanoid(7);
  const date = new Date().toISOString().slice(0, 10);
  const title = `비트코인 시세 분석 ${idx + 1}`;
  const summary = `이것은 ${idx + 1}번째 비트코인 시장 동향 요약입니다.`;

  return {
    id,
    title,
    summary,
    date,
    content: `최근 시장 동향을 바탕으로 한 ${idx + 1}차 분석 보고입니다.`,
    reporter: randomReporter(),
    image: `https://source.unsplash.com/800x400/?crypto&sig=${idx}`,
    slug: makeSlug(title, date, id)
  };
}