
import React from 'react';
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
  return (
    <div 
      className={`aspect-square rounded overflow-hidden cursor-pointer border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
      onClick={onClick}
    >
      <img 
        src={variant.url} 
        alt={`${variant.color}`} 
        className="w-full h-full object-cover" 
      />
    </div>
  );
};

export default CarouselItemVariant;
