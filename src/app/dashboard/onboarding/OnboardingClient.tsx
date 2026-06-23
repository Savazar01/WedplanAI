"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadOnboardingCSVAction } from "./actions";
import { useRouter } from "next/navigation";

interface OnboardingClientProps {
  weddingId: string;
  baseURL: string;
}

export default function OnboardingClient({ weddingId, baseURL }: OnboardingClientProps) {
  const router = useRouter();
  const onboardingLink = `${baseURL}/couple/onboarding/${weddingId}`;
  const [copied, setCopied] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(onboardingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "partner_a,partner_b,tradition,wedding_date,budget,location,location_name\n";
    const sampleRow = "Jane Doe,John Doe,christian,2026-12-25,50000,New York NY,St. Patrick's Cathedral";
    const csvContent = headers + sampleRow;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "wedding_onboarding_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Please select a valid CSV file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await uploadOnboardingCSVAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById("csv-file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Link Delegation Section ─── */}
      <Card variant="default" className="p-6 border-slate-200 shadow-sm bg-white">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Delegate to Couple via Public Link</h2>
            <p className="text-sm text-slate-500">
              Provide this unique, secure link to the couple. They can access it without logging in to fill out their partner details, cultural tradition, budget, and venue location.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              readOnly
              value={onboardingLink}
              className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#6771ab] text-slate-600 truncate"
            />
            <Button
              onClick={handleCopyLink}
              variant={copied ? "secondary" : "primary"}
              className="px-6 py-2 shrink-0 transition-all font-semibold"
            >
              {copied ? "Copied! ✓" : "Copy Link"}
            </Button>
          </div>
        </div>
      </Card>

      {/* ─── Spreadsheet Upload Section ─── */}
      <Card variant="default" className="p-6 border-slate-200 shadow-sm bg-white">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Bulk Onboard via Spreadsheet</h2>
            <p className="text-sm text-slate-500">
              Already have the wedding details on a spreadsheet? Download the CSV template, fill in the columns, and upload it below to configure the wedding details instantly.
            </p>
          </div>

          {/* Download Template Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">CSV Spreadsheet Template</p>
              <p className="text-xs text-slate-500 mt-1">Contains columns: partner_a, partner_b, tradition, wedding_date, budget, location, location_name</p>
            </div>
            <Button
              onClick={handleDownloadTemplate}
              variant="ghost"
              className="text-[#6771ab] border border-slate-200 hover:bg-slate-100/80 font-semibold"
            >
              Download CSV Template
            </Button>
          </div>

          {/* File Upload Form */}
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="csv-file-input" className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Upload Completed CSV
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-white file:text-[#6771ab] hover:file:bg-slate-50 cursor-pointer"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
                🎉 Onboarding details successfully uploaded and updated!
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={!file || isUploading}
                variant="primary"
                className="w-full sm:w-auto font-semibold px-6 py-2.5"
              >
                {isUploading ? "Uploading & Processing..." : "Upload & Apply Spreadsheet"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
