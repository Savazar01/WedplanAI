import { redirect } from "next/navigation";

// This page has been moved to /dashboard/admin/users
export default function OldUsersPage() {
  redirect("/dashboard/admin/users");
}
