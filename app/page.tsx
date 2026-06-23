import { redirect } from "next/navigation";
import { getRoleHomePath, requireSession } from "@/services/auth-service";

export default async function Home() {
  const session = await requireSession();
  redirect(getRoleHomePath(session.role));
}
