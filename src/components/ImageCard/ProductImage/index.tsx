
import React, { useState, useEffect } from 'react';
import { Image } from 'lucide-react';
import { ProductImageProps } from './types';
import LoadingSpinner from './LoadingSpinner';

const ProductImage = ({ 
  thumbnailUrl, 
  fullSizeUrl,
  title, 
  isLoading, 
  hasVariants, 
  onToggleVariants, 
  isLoadingProduct,
  handleClick 
}: ProductImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  
  // Use the full size URL if provided, otherwise fall back to thumbnail
  const displayUrl = useFallback ? thumbnailUrl : (fullSizeUrl || thumbnailUrl);

  // Log image details for debugging
  useEffect(() => {
    if (fullSizeUrl) {
      console.log('Full size URL available:', fullSizeUrl);
    } else {
      console.log('No full size URL, using thumbnail:', thumbnailUrl);
    }
  }, [fullSizeUrl, thumbnailUrl]);

  return (
    <div className="relative pb-[100%] bg-white" onClick={handleClick}>
      {/* Main Product Image with fullSizeUrl if available */}
      <img 
        src={displayUrl} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover" 
        loading="lazy" 
        onLoad={(e) => {
          setImageLoaded(true);
          // Log image dimensions to verify we're getting larger images
          const img = e.target as HTMLImageElement;
          console.log(`Image loaded: ${img.naturalWidth}x${img.naturalHeight}`);
        }}
        onError={() => {
          console.log("Error loading image, falling back to thumbnail");
          if (!useFallback && fullSizeUrl) {
            setUseFallback(true);
          }
          setImageLoaded(true);
        }}
      />
      
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
