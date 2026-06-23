import { redirect } from "next/navigation";

export default function AdminApproverPage() {
  redirect("/admin/user?role=approver");
}
