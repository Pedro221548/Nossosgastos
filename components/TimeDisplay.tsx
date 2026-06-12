import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const TimeDisplay: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-center space-x-4 mt-6" id="time-display-container">
      <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.2em]" id="time-display-date">{formattedDate}</p>
      <span className="text-neutral-300 dark:text-neutral-800 opacity-30">|</span>
      <div className="flex items-center space-x-2">
        <Clock size={12} className="text-primary" id="time-display-icon" />
        <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-widest tabular-nums" id="time-display-time">{formattedTime}</p>
      </div>
    </div>
  );
};
