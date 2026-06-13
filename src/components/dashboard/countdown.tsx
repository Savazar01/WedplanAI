"use client";

import * as React from "react";

interface CountdownProps {
  weddingDate: Date | string;
}

export default function Countdown({ weddingDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  React.useEffect(() => {
    const target = new Date(weddingDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [weddingDate]);

  if (timeLeft.isOver) {
    return <span className="font-semibold text-lg text-emerald-600 font-sans">The Big Day has arrived! 🎉</span>;
  }

  return (
    <div className="grid grid-cols-4 gap-2 text-center mt-2 max-w-sm font-sans">
      <div className="bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-slate-100">
        <div className="text-xl font-bold text-[#6771ab]">{timeLeft.days}</div>
        <div className="text-[10px] text-slate-500 uppercase font-semibold">Days</div>
      </div>
      <div className="bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-slate-100">
        <div className="text-xl font-bold text-[#6771ab]">{timeLeft.hours}</div>
        <div className="text-[10px] text-slate-500 uppercase font-semibold">Hours</div>
      </div>
      <div className="bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-slate-100">
        <div className="text-xl font-bold text-[#6771ab]">{timeLeft.minutes}</div>
        <div className="text-[10px] text-slate-500 uppercase font-semibold">Mins</div>
      </div>
      <div className="bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-slate-100">
        <div className="text-xl font-bold text-[#6771ab]">{timeLeft.seconds}</div>
        <div className="text-[10px] text-slate-500 uppercase font-semibold">Secs</div>
      </div>
    </div>
  );
}
