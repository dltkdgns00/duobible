import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const BOOK_NAMES = {
  창: "창세기",
  출: "출애굽기",
  레: "레위기",
  민: "민수기",
  신: "신명기",
  수: "여호수아",
  삿: "사사기",
  룻: "룻기",
  삼상: "사무엘상",
  삼하: "사무엘하",
  왕상: "열왕기상",
  왕하: "열왕기하",
  대상: "역대상",
  대하: "역대하",
  스: "에스라",
  느: "느헤미야",
  에: "에스더",
  욥: "욥기",
  시: "시편",
  잠: "잠언",
  전: "전도서",
  아: "아가",
  사: "이사야",
  렘: "예레미야",
  애: "예레미야애가",
  겔: "에스겔",
  단: "다니엘",
  호: "호세아",
  욜: "요엘",
  암: "아모스",
  옵: "오바댜",
  욘: "요나",
  미: "미가",
  나: "나훔",
  합: "하박국",
  습: "스바냐",
  학: "학개",
  슥: "스가랴",
  말: "말라기",
  마: "마태복음",
  막: "마가복음",
  눅: "누가복음",
  요: "요한복음",
  행: "사도행전",
  롬: "로마서",
  고전: "고린도전서",
  고후: "고린도후서",
  갈: "갈라디아서",
  엡: "에베소서",
  빌: "빌립보서",
  골: "골로새서",
  살전: "데살로니가전서",
  살후: "데살로니가후서",
  딤전: "디모데전서",
  딤후: "디모데후서",
  딛: "디도서",
  몬: "빌레몬서",
  히: "히브리서",
  약: "야고보서",
  벧전: "베드로전서",
  벧후: "베드로후서",
  요일: "요한일서",
  요이: "요한이서",
  요삼: "요한삼서",
  유: "유다서",
  계: "요한계시록",
};

const BOOK_ORDER = Object.keys(BOOK_NAMES);
const verseKey = /^(.+?)(\d+):(\d+)$/;

const raw = JSON.parse(fs.readFileSync(path.join(root, "bible.json"), "utf8"));
/** @type {Record<string, Record<number, Record<number, string>>>} */
const nested = Object.fromEntries(BOOK_ORDER.map((abbr) => [abbr, {}]));

let skipped = 0;
for (const [key, text] of Object.entries(raw)) {
  const match = verseKey.exec(key);
  if (!match) {
    skipped += 1;
    continue;
  }
  const abbr = match[1];
  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  if (!nested[abbr]) {
    skipped += 1;
    continue;
  }
  if (!nested[abbr][chapter]) nested[abbr][chapter] = {};
  nested[abbr][chapter][verse] = String(text).trim();
}

/** @type {Array<{index:number,abbr:string,book:string,chapter:number,verses:Array<{v:number,t:string}>}>} */
const chapters = [];
/** @type {Array<{abbr:string,book:string,chapterCount:number,startIndex:number}>} */
const books = [];

for (const abbr of BOOK_ORDER) {
  const chapterNums = Object.keys(nested[abbr])
    .map(Number)
    .sort((a, b) => a - b);
  if (chapterNums.length === 0) continue;
  const startIndex = chapters.length;
  for (const chapter of chapterNums) {
    const verses = nested[abbr][chapter];
    chapters.push({
      index: chapters.length,
      abbr,
      book: BOOK_NAMES[abbr],
      chapter,
      verses: Object.keys(verses)
        .map(Number)
        .sort((a, b) => a - b)
        .map((v) => ({ v, t: verses[v] })),
    });
  }
  books.push({
    abbr,
    book: BOOK_NAMES[abbr],
    chapterCount: chapterNums.length,
    startIndex,
  });
}

const outDir = path.join(root, "data");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "chapters.json"),
  JSON.stringify({ chapters }),
);
fs.writeFileSync(path.join(outDir, "books.json"), JSON.stringify({ books }));

console.log(
  `Wrote ${chapters.length} chapters, ${books.length} books (skipped ${skipped} keys)`,
);
