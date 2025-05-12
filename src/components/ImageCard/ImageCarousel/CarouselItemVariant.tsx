
import React, { useState } from 'react';
import { ImageVariant } from './types';

interface CarouselItemVariantProps {
  variant: ImageVariant;
  isSelected: boolean;
  onClick: () => void;
}

const CarouselItemVariant: React.FC<CarouselItemVariantProps> = ({
  variant,
  isSelected,
  onClick
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  return (
    <div 
      className={`aspect-square rounded overflow-hidden cursor-pointer border-2 relative
        ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
      onClick={onClick}
      title={variant.color} // Add tooltip with color name
    >
      {/* Show loading spinner while image is loading */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Show error icon if image failed to load */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"></path>
            <path d="M2 12s3.64-7 10-7 10 7 10 7-3.64 7-10 7-10-7-10-7Z"></path>
          </svg>
        </div>
      )}
      
      <img 
        src={variant.url} 
        alt={`${variant.color}`}
        className={`w-full h-full object-cover transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      
      {/* Small color indicator label at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-xs text-white py-0.5 px-1 truncate text-center">
        {variant.color}
      </div>
    </div>
  );
};

export default CarouselItemVariant;
