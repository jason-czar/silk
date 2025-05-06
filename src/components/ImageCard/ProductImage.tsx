
import { useState } from 'react';
import { Image } from 'lucide-react';

interface ProductImageProps {
  thumbnailUrl: string;
  title: string;
  isLoading: boolean;
  hasVariants: boolean;
  onToggleVariants: () => void;
  isLoadingProduct: boolean;
  handleClick: (e: React.MouseEvent) => void;
}

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
          <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
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
          <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
