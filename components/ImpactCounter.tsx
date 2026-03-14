'use client';

import { useEffect, useState } from 'react';

export default function ImpactCounter() {
  const [count, setCount] = useState(0);
  const targetCount = 12847; // Total impact actions

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <div className="font-serif text-[clamp(3rem,8vw,6rem)] font-black text-transparent bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text leading-none mb-4 [text-shadow:0_0_60px_rgba(116,198,157,0.3)]">
        {count.toLocaleString()}+
      </div>
      <p className="text-[rgba(183,228,199,0.7)] text-lg font-medium tracking-wide">
        Total Environmental Actions Taken
      </p>
      <p className="text-[rgba(183,228,199,0.4)] text-sm mt-2">
        Every action brings us closer to a sustainable future
      </p>
    </div>
  );
}
