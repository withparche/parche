import { useState } from 'react';

export default function Counter({ start = 0 }: { start?: number }) {
  const [count, setCount] = useState(start);
  const btn = 'h-9 w-9 rounded-full bg-primary text-on-primary text-lg leading-none';
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2">
      <button className={btn} onClick={() => setCount((c) => c - 1)} aria-label="decrement">
        –
      </button>
      <span className="min-w-10 text-center text-lg font-semibold text-heading">{count}</span>
      <button className={btn} onClick={() => setCount((c) => c + 1)} aria-label="increment">
        +
      </button>
    </div>
  );
}
