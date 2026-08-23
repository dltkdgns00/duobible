import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userId?: number;
  name?: string;
  cohort?: number;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "duobible-dev-session-secret-change-me-32chars",
  cookieName: "duobible_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 180,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.name) {
    return null;
  }
  return { id: session.userId, name: session.name, cohort: session.cohort ?? 2 };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isAdmin) return null;
  return true;
}
