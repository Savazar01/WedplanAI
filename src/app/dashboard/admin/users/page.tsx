import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createSubsequentUserAction } from "./actions";
import CreateUserFormClient from "./CreateUserFormClient";

export default async function UsersManagementPage() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Ensure active wedding logic is executed (redirects to wizard if no wedding is found)
  await getActiveWedding(session.user.id);

  const allUsers = await db.select().from(users).orderBy(users.createdAt);

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card variant="cream" className="p-6 sticky top-24 border border-slate-200">
          <h2 className="text-lg font-bold text-[#6771ab] mb-2">Add Team Member</h2>
          <p className="text-xs text-slate-500 mb-6">Add subsequent team member credentials. Note that public signup is locked.</p>
          
          <CreateUserFormClient createAction={createSubsequentUserAction} />
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Team Directory ({allUsers.length})</h2>
        
        <Card variant="default" className="overflow-hidden bg-white shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-semibold ${
                        u.role === "admin" 
                          ? "bg-violet-100 text-[#2d336b]" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
