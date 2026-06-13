"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { batchInsertGuestsAction, BatchGuestInput } from "@/app/actions/guests";

interface GuestCsvUploadProps {
  weddingId: string;
}

export default function GuestCsvUpload({ weddingId }: GuestCsvUploadProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a CSV file first." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      if (lines.length <= 1) {
        setMessage({ type: "error", text: "The CSV file seems to be empty or has no data rows." });
        setLoading(false);
        return;
      }

      // Parse headers
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
      
      const guestsList: BatchGuestInput[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Basic CSV row split handling quotes
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) => v.trim().replace(/^["']|["']$/g, ""));

        const guest: Record<string, string> = {};
        headers.forEach((header, index) => {
          guest[header] = values[index] !== undefined ? values[index] : "";
        });

        if (guest.name) {
          guestsList.push({
            name: guest.name,
            email: guest.email || null,
            phone: guest.phone || null,
            rsvpStatus: guest.rsvpStatus || "pending",
            plusOneCount: parseInt(guest.plusOneCount) || 0,
            dietaryRestrictions: guest.dietaryRestrictions || null,
          });
        }
      }

      if (guestsList.length === 0) {
        setMessage({ type: "error", text: "No valid guests found in the CSV. Make sure there's a 'name' column." });
        setLoading(false);
        return;
      }

      const res = await batchInsertGuestsAction(weddingId, guestsList);

      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: `Successfully imported ${guestsList.length} guests!` });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to parse CSV file." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 font-sans">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          id="csv-file-input"
          disabled={loading}
        />
        <label
          htmlFor="csv-file-input"
          className="cursor-pointer px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all active:scale-[0.97]"
        >
          {file ? file.name : "Choose CSV File"}
        </label>
        <Button
          onClick={handleUpload}
          variant="primary"
          disabled={!file || loading}
          className="rounded-xl shadow-md bg-[#6771ab] text-white hover:bg-[#566198] active:scale-[0.97] transition-all"
        >
          {loading ? "Importing..." : "Upload & Import"}
        </Button>
      </div>
      <div className="flex justify-between w-full items-center">
        <a
          href="/sample-guests.csv"
          download
          className="text-xs text-[#6771ab] hover:underline"
        >
          📥 Download sample-guests.csv
        </a>
      </div>
      {message && (
        <span className={`text-xs font-semibold mt-2 ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}
