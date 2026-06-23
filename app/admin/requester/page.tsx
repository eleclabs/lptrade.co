import { redirect } from "next/navigation";

export default function AdminRequesterPage() {
  redirect("/admin/user?role=requester");
}
