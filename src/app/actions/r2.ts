"use server";

import { db } from "@/db/client";
import { r2Configurations } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function getR2ConfigAction() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    const configs = await db.select().from(r2Configurations).limit(1);
    return { success: true, config: configs[0] || null };
  } catch (error) {
    console.error("getR2ConfigAction error:", error);
    return { error: "Failed to fetch R2 configuration." };
  }
}

export async function saveR2ConfigAction(data: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain?: string;
  isActive: boolean;
}) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.accountId || !data.accessKeyId || !data.secretAccessKey || !data.bucketName) {
    return { error: "Account ID, Access Key ID, Secret Access Key, and Bucket Name are required." };
  }

  try {
    // If setting to active, deactivate other configurations
    if (data.isActive) {
      await db.update(r2Configurations).set({ isActive: false });
    }

    const existing = await db.select().from(r2Configurations).limit(1);

    if (existing.length > 0) {
      await db
        .update(r2Configurations)
        .set({
          accountId: data.accountId,
          accessKeyId: data.accessKeyId,
          secretAccessKey: data.secretAccessKey,
          bucketName: data.bucketName,
          publicDomain: data.publicDomain || null,
          isActive: data.isActive,
          updatedAt: new Date(),
        })
        .where(eq(r2Configurations.id, existing[0].id));
    } else {
      await db.insert(r2Configurations).values({
        accountId: data.accountId,
        accessKeyId: data.accessKeyId,
        secretAccessKey: data.secretAccessKey,
        bucketName: data.bucketName,
        publicDomain: data.publicDomain || null,
        isActive: data.isActive,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("saveR2ConfigAction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to save R2 configuration." };
  }
}

export async function testR2ConfigAction(data: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.accountId || !data.accessKeyId || !data.secretAccessKey || !data.bucketName) {
    return { error: "All fields are required to test R2 connection." };
  }

  try {
    // Initialize S3 client for Cloudflare R2
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${data.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: data.accessKeyId,
        secretAccessKey: data.secretAccessKey,
      },
    });

    // Attempt to upload a small test file to the bucket
    const key = "test-connection-file.txt";
    const command = new PutObjectCommand({
      Bucket: data.bucketName,
      Key: key,
      Body: "Connection Test Successful",
      ContentType: "text/plain",
    });

    await s3.send(command);

    return { success: true };
  } catch (error) {
    console.error("testR2ConfigAction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to connect to R2 bucket. Please check credentials and bucket configuration." };
  }
}
