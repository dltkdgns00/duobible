import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function bruteForceHash(pinHash: string, label: string) {
  console.log(`\n========================================`);
  console.log(`해시 복구 대상: ${label}`);
  console.log(`해시값: ${pinHash}`);
  console.log(`핀 번호를 역추적하는 중 (0000 ~ 9999)...`);
  console.log(`※ bcrypt 연산 특성상 최대 8~10분이 소요될 수 있습니다. `);
  console.log(`========================================\n`);

  const startTime = Date.now();
  let foundPin: string | null = null;

  for (let i = 0; i <= 9999; i++) {
    const pin = String(i).padStart(4, "0");
    
    // 500번 단위로 진척도 출력
    if (i > 0 && i % 500 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      console.log(`진행률: ${(i / 100).toFixed(0)}% 완료 (${i}/10000 번 시도됨, 경과 시간: ${elapsed.toFixed(1)}초)...`);
    }

    if (bcrypt.compareSync(pin, pinHash)) {
      foundPin = pin;
      break;
    }
  }

  const duration = (Date.now() - startTime) / 1000;

  if (foundPin) {
    console.log(`\n========================================`);
    console.log(`성공: '${label}' 님의 핀 번호는 [ ${foundPin} ] 입니다!`);
    console.log(`소요 시간: ${duration.toFixed(2)}초`);
    console.log(`========================================\n`);
  } else {
    console.log(`\n실패: 핀 번호를 찾지 못했습니다. (해시가 4자리 숫자가 아니거나 다른 알고리즘일 수 있습니다)\n`);
  }
}

async function main() {
  // 인자 또는 환경변수 확인
  const inputHash = process.argv[2] || process.env.TARGET_HASH;
  if (inputHash) {
    await bruteForceHash(inputHash, "직접 입력한 해시");
    return;
  }

  // 기존 로컬 SQLite 조회 로직
  const targetName = "탕준";
  console.log("환경변수 확인:");
  console.log("  TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL ? "존재함" : "없음");
  console.log(`DB에서 사용자 '${targetName}'을(를) 찾는 중... (로컬 SQLite)`);

  const user = await prisma.user.findUnique({
    where: { name: targetName }
  });

  if (!user) {
    console.error(`오류: '${targetName}' 사용자를 찾을 수 없습니다.`);
    const allUsers = await prisma.user.findMany({ select: { name: true } });
    console.log("현재 로컬 DB에 존재하는 사용자 목록:", allUsers.map(u => u.name));
    console.log("\n[안내] 실서버(Turso)에 있는 사용자의 PIN 번호를 복구하려면,");
    console.log("관리자 페이지에서 사용자 PIN 해시를 조회한 뒤, 아래와 같이 스크립트를 실행하세요:");
    console.log("npx tsx scripts/find-pin.ts <해시값>");
    return;
  }

  await bruteForceHash(user.pinHash, targetName);
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
