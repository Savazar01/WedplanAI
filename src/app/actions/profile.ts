"use server";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface UpdateProfileInput {
  name: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  languages?: string;
  persona?: string;
}

export async function updateProfileAction(input: UpdateProfileInput) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const { name, street, city, state, country, pincode, languages, persona } = input;

  if (!name || name.trim().length === 0) {
    return { error: "Name is required." };
  }

  try {
    const isAdmin = session.user.role === "admin";
    const updateData: Record<string, any> = {
      name: name.trim(),
      street: street?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      country: country?.trim() || null,
      pincode: pincode?.trim() || null,
      languages: languages?.trim() || null,
      updatedAt: new Date(),
    };

    if (isAdmin && persona) {
      updateData.persona = persona;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err) {
    console.error("Failed to update profile:", err);
    return { error: "Failed to save profile. Please try again." };
  }
}

export async function getProfileAction() {
  const session = await getServerSession();
  if (!session || !session.user) {
    return null;
  }

  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return profile || null;
}
