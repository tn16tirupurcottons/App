import React, { useEffect, useState } from "react";

const pad = (value) => String(value).padStart(2, "0");

export default function DealTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date(endTime).getTime() - Date.now();
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();
      setTimeLeft(Math.max(0, diff));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!endTime) return null;

  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="rounded-2xl bg-neutral-950/90 px-3 py-2 text-white text-xs font-semibold tracking-[0.15em] uppercase inline-flex gap-2 items-center">
      <span>Ends in</span>
      <span>{days > 0 ? `${days}d` : `${pad(hours)}h`}</span>
      <span>{pad(minutes)}m</span>
      <span>{pad(seconds)}s</span>
    </div>
  );
}
