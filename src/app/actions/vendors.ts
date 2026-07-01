"use server";

import { db } from "@/db/client";
import { vendors } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { getActiveWedding } from "@/lib/wedding-helper";
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
  ceremonyId?: string | null;
  invoiceUrl?: string | null;
  invoiceData?: string | null;
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

  const totalCostInt = Math.round(data.totalCost || 0);
  const paidAmountInt = Math.round(data.paidAmount || 0);

  let paymentStatus: "unpaid" | "partially_paid" | "paid" = "unpaid";
  if (paidAmountInt === totalCostInt && totalCostInt > 0) {
    paymentStatus = "paid";
  } else if (paidAmountInt > 0) {
    paymentStatus = "partially_paid";
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) {
    return { error: "No wedding profile found." };
  }
  const weddingId = wedding.id;

  try {
    await db.insert(vendors).values({
      weddingId,
      name: data.name,
      category: data.category,
      contactPerson: data.contactPerson || null,
      phone: data.phone || null,
      email: data.email || null,
      totalCost: totalCostInt,
      paidAmount: paidAmountInt,
      paymentStatus,
      notes: data.notes || null,
      ceremonyId: data.ceremonyId || null,
      invoiceUrl: data.invoiceUrl || null,
      invoiceData: data.invoiceData || null,
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
    ceremonyId?: string | null;
    invoiceUrl?: string | null;
    invoiceData?: string | null;
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

  const totalCostInt = Math.round(data.totalCost || 0);
  const paidAmountInt = Math.round(data.paidAmount || 0);

  let paymentStatus: "unpaid" | "partially_paid" | "paid" = "unpaid";
  if (paidAmountInt === totalCostInt && totalCostInt > 0) {
    paymentStatus = "paid";
  } else if (paidAmountInt > 0 && paidAmountInt < totalCostInt) {
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
        totalCost: totalCostInt,
        paidAmount: paidAmountInt,
        paymentStatus,
        notes: data.notes || null,
        ceremonyId: data.ceremonyId || null,
        invoiceUrl: data.invoiceUrl || null,
        invoiceData: data.invoiceData || null,
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

export async function uploadVendorInvoiceAction(base64Data: string, fileName: string, fileType: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const { r2Configurations } = await import("@/db/schema");
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

  try {
    const activeR2s = await db.select().from(r2Configurations).where(eq(r2Configurations.isActive, true)).limit(1);
    if (activeR2s.length === 0) {
      return { success: false, fallbackToBase64: true };
    }

    const r2Config = activeR2s[0];
    
    // Initialize S3 client for R2
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    });

    const buffer = Buffer.from(base64Data.split(",")[1] || base64Data, "base64");
    const uniqueKey = `invoices/${Date.now()}-${fileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: uniqueKey,
        Body: buffer,
        ContentType: fileType,
      })
    );

    const publicUrl = r2Config.publicDomain
      ? `${r2Config.publicDomain}/${uniqueKey}`
      : `https://${r2Config.accountId}.r2.cloudflarestorage.com/${r2Config.bucketName}/${uniqueKey}`;

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("uploadVendorInvoiceAction error:", error);
    return { success: false, fallbackToBase64: true, error: error instanceof Error ? error.message : "R2 upload failed" };
  }
}

