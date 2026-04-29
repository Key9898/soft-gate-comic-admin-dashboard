import { useEffect, useRef } from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
}

export const ProgressBar = ({ value, max = 100, className = '' }: ProgressBarProps) => {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (barRef.current) {
      const percentage = Math.min((value / max) * 100, 100)
      barRef.current.style.width = `${percentage}%`
    }
  }, [value, max])

  return (
    <div className={`flex-1 h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div ref={barRef} className="progress-bar" />
    </div>
  )
}

export default ProgressBar
