import { useEffect, useState } from 'react';

function calcCountdown(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return new Date(deadline).toLocaleDateString();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}

export function useDeadlineCountdown(deadline: string): string {
  const [label, setLabel] = useState(() => deadline ? calcCountdown(deadline) : '');

  useEffect(() => {
    if (!deadline || new Date(deadline) < new Date()) return;
    setLabel(calcCountdown(deadline));
    const id = setInterval(() => setLabel(calcCountdown(deadline)), 60_000);
    return () => clearInterval(id);
  }, [deadline]);

  return label;
}
