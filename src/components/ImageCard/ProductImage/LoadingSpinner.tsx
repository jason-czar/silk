
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  const sizeClass = {
    small: 'h-4 w-4 border-2',
    medium: 'h-6 w-6 border-4',
    large: 'h-8 w-8 border-4'
  };

  return (
    <div className={`animate-spin ${sizeClass[size]} border-white border-t-transparent rounded-full`}></div>
  );
};

export default LoadingSpinner;
