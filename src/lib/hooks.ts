import { useEffect, useState } from 'react';

/** Current time as state. Pass an interval (ms) to keep it ticking; 0 reads it once per mount. */
export function useNow(every = 0) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!every) return;
    const t = setInterval(() => setNow(Date.now()), every);
    const wake = () => { if (!document.hidden) setNow(Date.now()); };
    document.addEventListener('visibilitychange', wake);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', wake); };
  }, [every]);
  return now;
}
