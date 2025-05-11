
import React from 'react';
import { Image } from 'lucide-react';
import { ProductImageProps } from './types';
import LoadingSpinner from './LoadingSpinner';

const ProductImage = ({ 
  thumbnailUrl, 
  title, 
  isLoading, 
  hasVariants, 
  onToggleVariants, 
  isLoadingProduct,
  handleClick 
}: ProductImageProps) => {
  return (
    <div className="relative pb-[100%] bg-white" onClick={handleClick}>
      <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <LoadingSpinner />
        </div>
      )}

      {/* Color variant indicator - only shows if we have variants */}
      {hasVariants && (
        <div 
          className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVariants();
          }}
        >
          <Image size={16} className="text-gray-600" />
        </div>
      )}
      
      {/* Loading indicator for product details */}
      {isLoadingProduct && (
        <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-sm">
          <LoadingSpinner size="small" />
        </div>
      )}
    </div>
  );
};

export default ProductImage;
