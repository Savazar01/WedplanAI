import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { getChatMessagesAction } from "@/app/actions/chat";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const activeWedding = await getActiveWedding(session.user.id);
  if (!activeWedding || activeWedding.enableChat === false) {
    redirect("/dashboard");
  }

  const res = await getChatMessagesAction(activeWedding.id);

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Chat & Call
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Converse with your team and join video calls in real-time.
        </p>
      </div>
      <ChatInterface
        weddingId={activeWedding.id}
        initialMessages={res.success && res.messages ? res.messages : []}
        currentUserName={session.user.name}
        currentUserRole={
          session.user.role === "admin"
            ? "admin"
            : session.user.role === "client"
            ? "client"
            : "coordinator"
        }
      />
    </main>
  );
}
