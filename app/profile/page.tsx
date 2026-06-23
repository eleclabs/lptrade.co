import ProfileForm from "@/components/ProfileForm";
import { getProfile } from "@/services/auth-service";

type ProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
    updated?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const profile = await getProfile();
  const params = await searchParams;

  return (
    <div className="page-shell">
      <div className="row g-4">
        <div className="col-sm-12 col-lg-6">
          <ProfileForm
            profile={profile}
            hasError={params?.error === "invalid"}
            updated={params?.updated === "1"}
          />
        </div>
      </div>
    </div>
  );
}
