import LoginForm from "@/components/LoginForm";
import { getSession } from "@/services/auth-service";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <div className="auth-page">
      <LoginForm hasError={params?.error === "invalid"} />
    </div>
  );
}
