import { cookies } from "next/headers";
import { LanguageCode } from "./translations";

export async function getLocaleServer(): Promise<LanguageCode> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value as LanguageCode | undefined;
    return locale || "en";
  } catch (e) {
    return "en";
  }
}
