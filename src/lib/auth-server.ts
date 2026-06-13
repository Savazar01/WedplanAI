import { auth } from "./auth";
import { cookies, headers } from "next/headers";

export async function getServerSession() {
  // Await cookies and headers as required in Next.js v16
  await cookies();
  const headersList = await headers();
  
  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });
    return session;
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}
