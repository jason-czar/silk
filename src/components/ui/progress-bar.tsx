
import React, { useState, useEffect } from 'react';
import { Progress } from './progress';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
  complete?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = false,
  className = '',
  size = 'md',
  animate = true,
  complete = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Calculate the percentage
  const percentage = Math.round((value / max) * 100);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  // Animation effect
  useEffect(() => {
    if (animate) {
      // Start with the current display value
      let start = displayValue;
      const end = percentage;
      
      // If there's a big difference, animate it
      if (Math.abs(end - start) > 2) {
        const duration = 500; // ms
        const increment = Math.abs(end - start) > 20 ? 2 : 1; // Faster for larger differences
        const direction = end > start ? 1 : -1;
        const steps = Math.abs(end - start) / increment;
        const stepTime = duration / steps;
        
        let current = start;
        const timer = setInterval(() => {
          current += increment * direction;
          
          if ((direction > 0 && current >= end) || (direction < 0 && current <= end)) {
            clearInterval(timer);
            setDisplayValue(end);
          } else {
            setDisplayValue(current);
          }
        }, stepTime);
        
        return () => clearInterval(timer);
      } else {
        // Small difference, just set it
        setDisplayValue(percentage);
      }
    } else {
      // No animation, just set the value
      setDisplayValue(percentage);
    }
  }, [percentage, animate]);

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <p className="text-muted-foreground">{label}</p>}
          {showPercentage && (
            <p className="text-muted-foreground">{complete ? '100%' : `${displayValue}%`}</p>
          )}
        </div>
      )}
      <Progress 
        value={complete ? 100 : displayValue} 
        className={`${sizeClasses[size]} ${complete ? 'bg-green-100 dark:bg-green-900' : ''}`}
        // Add any additional custom styling
      />
    </div>
  );
};

export { ProgressBar };
