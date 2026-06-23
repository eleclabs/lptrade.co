import { redirect } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";
import { getSession } from "@/services/auth-service";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <div className="auth-page">
      <RegisterForm hasError={params?.error === "invalid"} />
    </div>
  );
}
