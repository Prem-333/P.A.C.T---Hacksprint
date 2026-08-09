import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserSession } from "@/hooks/useDashboard";

export default async function RootPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("pbr_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  let role: string | undefined;

  try {
    const token = decodeURIComponent(sessionCookie.value);
    const data = JSON.parse(Buffer.from(token, "base64").toString("utf-8")) as UserSession;
    role = data.role;
  } catch {
    redirect("/login");
  }

  if (role) {
    redirect(`/${role}`);
  } else {
    redirect("/login");
  }
}
