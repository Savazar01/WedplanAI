"use client";

import * as React from "react";

export default function ShareWeddingCard({
  weddingId,
  partnerA,
  partnerB,
}: {
  weddingId: string;
  partnerA: string;
  partnerB: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const [url, setUrl] = React.useState(`/wedding/${weddingId}`);

  React.useEffect(() => {
    setTimeout(() => {
      setUrl(`${window.location.origin}/wedding/${weddingId}`);
    }, 0);
  }, [weddingId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest">
            🌐 Wedding Showcase
          </h3>
          <p className="text-xs text-amber-700 mt-0.5">
            Share this link with your guests — {partnerA} &amp; {partnerB}
          </p>
        </div>
        <span className="text-2xl">💌</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-[11px] bg-white border border-amber-200 rounded-xl px-3 py-2 text-slate-600 truncate font-mono">
          {url}
        </code>
        <button
          onClick={handleCopy}
          className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            copied
              ? "bg-green-500 text-white"
              : "bg-amber-500 hover:bg-amber-600 text-white"
          }`}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <a
        href={`/wedding/${weddingId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-xl bg-[#6771ab] text-white text-xs font-semibold hover:bg-[#2d336b] transition-all"
      >
        🔗 Open Showcase Page
      </a>
    </div>
  );
}
