import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const targetName = "상훈";
  console.log(`DB에서 사용자 '${targetName}'을(를) 찾는 중...`);

  const user = await prisma.user.findUnique({
    where: { name: targetName }
  });

  if (!user) {
    console.error(`오류: '${targetName}' 사용자를 찾을 수 없습니다.`);
    const allUsers = await prisma.user.findMany({ select: { name: true } });
    console.log("현재 DB에 존재하는 사용자 목록:", allUsers.map(u => u.name));
    return;
  }

  console.log(`사용자를 찾았습니다. ID: ${user.id}, 해시: ${user.pinHash}`);
  console.log(`핀 번호를 역추적하는 중 (0000 ~ 9999)...`);

  const startTime = Date.now();
  let foundPin: string | null = null;

  for (let i = 0; i <= 9999; i++) {
    const pin = String(i).padStart(4, "0");
    if (bcrypt.compareSync(pin, user.pinHash)) {
      foundPin = pin;
      break;
    }
  }

  const duration = (Date.now() - startTime) / 1000;

  if (foundPin) {
    console.log(`\n========================================`);
    console.log(`성공: '${targetName}' 님의 핀 번호는 [ ${foundPin} ] 입니다!`);
    console.log(`소요 시간: ${duration.toFixed(2)}초`);
    console.log(`========================================\n`);
  } else {
    console.log(`실패: 핀 번호를 찾지 못했습니다. (해시가 4자리 숫자가 아니거나 다른 알고리즘일 수 있습니다)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
