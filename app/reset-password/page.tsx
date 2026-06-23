import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { getSession } from "@/services/auth-service";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
    error?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <div className="auth-page">
      <ResetPasswordForm
        hasError={params?.error === "invalid"}
        token={params?.token ?? ""}
      />
    </div>
  );
}
