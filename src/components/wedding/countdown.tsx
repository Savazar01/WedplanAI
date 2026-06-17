"use client";

import * as React from "react";

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setIsClient(true), 0);
    const target = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isClient) {
    return (
      <div className="flex gap-4 justify-center items-center font-sans">
        <div className="animate-pulse bg-slate-200 h-16 w-16 rounded-xl" />
        <div className="animate-pulse bg-slate-200 h-16 w-16 rounded-xl" />
        <div className="animate-pulse bg-slate-200 h-16 w-16 rounded-xl" />
        <div className="animate-pulse bg-slate-200 h-16 w-16 rounded-xl" />
      </div>
    );
  }

  const isPast = new Date(targetDate).getTime() < new Date().getTime();
  if (isPast) {
    return (
      <div className="text-center py-4">
        <span className="text-xl font-bold text-[var(--color-secondary)] tracking-widest uppercase font-serif">
          ✨ Happily Ever After ✨
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-lg mx-auto text-center">
      <div className="bg-white/80 backdrop-blur-xs border border-amber-200 p-3 md:p-4 rounded-2xl shadow-sm flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary)]">{timeLeft.days}</span>
        <span className="text-[10px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider mt-1">Days</span>
      </div>
      <div className="bg-white/80 backdrop-blur-xs border border-amber-200 p-3 md:p-4 rounded-2xl shadow-sm flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary)]">{timeLeft.hours}</span>
        <span className="text-[10px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider mt-1">Hours</span>
      </div>
      <div className="bg-white/80 backdrop-blur-xs border border-amber-200 p-3 md:p-4 rounded-2xl shadow-sm flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary)]">{timeLeft.minutes}</span>
        <span className="text-[10px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider mt-1">Mins</span>
      </div>
      <div className="bg-white/80 backdrop-blur-xs border border-amber-200 p-3 md:p-4 rounded-2xl shadow-sm flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary)]">{timeLeft.seconds}</span>
        <span className="text-[10px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider mt-1">Secs</span>
      </div>
    </div>
  );
}
