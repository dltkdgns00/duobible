import { redirect } from "next/navigation";
import { AuthForm } from "@/app/components/AuthForm";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl tracking-tight">함께 읽어요</h2>
        <p className="text-sm leading-relaxed text-muted">
          이름과 PIN 4자리로 가입하거나 로그인하세요. 오픈채팅에서 쓰는 이름이면
          알아보기 좋아요.
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
