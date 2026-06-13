"use server";

import { db } from "@/db/client";
import { vendors, weddings } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createVendorAction(data: {
  name: string;
  category: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  totalCost: number;
  paidAmount: number;
  notes?: string;
}) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  if (data.paidAmount > data.totalCost) {
    return { error: "Paid amount cannot exceed total contract cost." };
  }

  if (data.totalCost < 0 || data.paidAmount < 0) {
    return { error: "Costs must be non-negative." };
  }

  let paymentStatus: "unpaid" | "partially_paid" | "paid" = "unpaid";
  if (data.paidAmount === data.totalCost && data.totalCost > 0) {
    paymentStatus = "paid";
  } else if (data.paidAmount > 0) {
    paymentStatus = "partially_paid";
  }

  const userWeddings = await db
    .select()
    .from(weddings)
    .where(eq(weddings.userId, session.user.id))
    .limit(1);

  if (userWeddings.length === 0) {
    return { error: "No wedding profile found." };
  }
  const weddingId = userWeddings[0].id;

  try {
    await db.insert(vendors).values({
      weddingId,
      name: data.name,
      category: data.category,
      contactPerson: data.contactPerson || null,
      phone: data.phone || null,
      email: data.email || null,
      totalCost: data.totalCost,
      paidAmount: data.paidAmount,
      paymentStatus,
      notes: data.notes || null,
    });

    revalidatePath("/vendors");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create vendor error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create vendor";
    return { error: errorMessage };
  }
}

export async function deleteVendorAction(vendorId: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(vendors).where(eq(vendors.id, vendorId));

    revalidatePath("/vendors");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete vendor error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete vendor";
    return { error: errorMessage };
  }
}

export async function updateVendorAction(
  vendorId: string,
  data: {
    name: string;
    category: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    totalCost: number;
    paidAmount: number;
    notes?: string;
  }
) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  if (data.paidAmount > data.totalCost) {
    return { error: "Paid amount cannot exceed total contract cost." };
  }

  if (data.totalCost < 0 || data.paidAmount < 0) {
    return { error: "Costs must be non-negative." };
  }

  let paymentStatus: "unpaid" | "partially_paid" | "paid" = "unpaid";
  if (data.paidAmount === data.totalCost && data.totalCost > 0) {
    paymentStatus = "paid";
  } else if (data.paidAmount > 0 && data.paidAmount < data.totalCost) {
    paymentStatus = "partially_paid";
  }

  try {
    await db
      .update(vendors)
      .set({
        name: data.name,
        category: data.category,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        totalCost: data.totalCost,
        paidAmount: data.paidAmount,
        paymentStatus,
        notes: data.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId));

    revalidatePath("/vendors");
    revalidatePath("/dashboard/vendors");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update vendor error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update vendor";
    return { error: errorMessage };
  }
}

