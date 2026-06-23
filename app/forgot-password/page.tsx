import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { getSession } from "@/services/auth-service";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    sent?: string;
    token?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <div className="auth-page">
      <ForgotPasswordForm
        resetToken={params?.token}
        sent={params?.sent === "1"}
      />
    </div>
  );
}
