import { useEffect, useRef } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export const ProgressBar = ({ value, max = 100, className = '' }: ProgressBarProps) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      const percentage = Math.min((value / max) * 100, 100);
      barRef.current.style.width = `${percentage}%`;
    }
  }, [value, max]);

  return (
    <div className={`h-2 flex-1 overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div ref={barRef} className="progress-bar" />
    </div>
  );
};

export default ProgressBar;
