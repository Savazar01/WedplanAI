"use server";

import { db } from "@/db/client";
import { weddings } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding, ensureDefaultColumns } from "@/lib/wedding-helper";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function uploadOnboardingCSVAction(formData: FormData) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.persona !== "wedding_planner") {
    return { error: "Unauthorized. Planners only." };
  }

  const activeWedding = await getActiveWedding(session.user.id);
  if (!activeWedding) {
    return { error: "No active wedding found to update." };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file uploaded." };
  }

  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { error: "CSV file must contain a header row and at least one data row." };
    }

    // Parse CSV helper that handles quotes and commas
    const parseLine = (line: string) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(val => val.replace(/^"|"$/g, ''));
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase());
    const dataRows = lines.slice(1).map(parseLine);

    if (dataRows.length === 0) {
      return { error: "CSV contains no data rows." };
    }

    const row = dataRows[0];
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      data[header] = row[index] || "";
    });

    // Extract columns: partner_a,partner_b,tradition,wedding_date,budget,location,location_name
    const partnerA = data["partner_a"];
    const partnerB = data["partner_b"];
    const tradition = data["tradition"];
    const weddingDateRaw = data["wedding_date"];
    const budgetRaw = data["budget"];
    const location = data["location"];
    const locationName = data["location_name"];

    if (!partnerA || !partnerB || !tradition || !weddingDateRaw || !location) {
      return { error: "Missing required columns in CSV: partner_a, partner_b, tradition, wedding_date, and location are mandatory." };
    }

    const weddingDateObj = new Date(weddingDateRaw);
    if (isNaN(weddingDateObj.getTime())) {
      return { error: "Invalid date format for wedding_date. Use YYYY-MM-DD." };
    }

    const budgetInt = parseInt(budgetRaw, 10);
    if (isNaN(budgetInt) || budgetInt < 0) {
      return { error: "Invalid number format for budget." };
    }

    // Update the wedding record
    await db.update(weddings)
      .set({
        partnerA,
        partnerB,
        tradition,
        weddingDate: weddingDateObj,
        budget: budgetInt,
        location,
        locationName: locationName || null,
        updatedAt: new Date(),
      })
      .where(eq(weddings.id, activeWedding.id));

    await ensureDefaultColumns(activeWedding.id);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("CSV upload processing failed:", error);
    return { error: error instanceof Error ? error.message : "Failed to process CSV file." };
  }
}
