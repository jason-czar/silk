import React, { useState, useEffect } from 'react';
import { Image } from 'lucide-react';
import { ProductImageProps } from './types';
import LoadingSpinner from './LoadingSpinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackError } from '@/services/analytics';

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
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState(false);
  const isMobile = useIsMobile();
  
  // Use the full size URL if provided, otherwise fall back to thumbnail
  const displayUrl = useFallback ? thumbnailUrl : (fullSizeUrl || thumbnailUrl);
  
  // Reset image loaded state when URL changes
  useEffect(() => {
    setImageLoaded(loadedImages[displayUrl] || false);
    setLoadError(false);
  }, [displayUrl, loadedImages]);

  // Log image details for debugging
  useEffect(() => {
    if (fullSizeUrl) {
      console.log('Full size URL available:', fullSizeUrl);
    } else {
      console.log('No full size URL, using thumbnail:', thumbnailUrl);
    }
  }, [fullSizeUrl, thumbnailUrl]);

  return (
    <div 
      className="relative pb-[100%] bg-white touch-manipulation"
      onClick={handleClick}
    >
      {/* Main Product Image with fullSizeUrl if available */}
      <img 
        src={displayUrl} 
        alt={title} 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy" 
        decoding="async" // Add decoding async for better performance
        onLoad={(e) => {
          setImageLoaded(true);
          setLoadError(false);
          
          // Keep track of which images have been loaded
          setLoadedImages(prev => ({...prev, [displayUrl]: true}));
          
          // Log image dimensions to verify we're getting larger images
          const img = e.target as HTMLImageElement;
          console.log(`Image loaded: ${img.naturalWidth}x${img.naturalHeight}`);
        }}
        onError={(e) => {
          console.log("Error loading image, falling back to thumbnail");
          setLoadError(true);
          
          if (!useFallback && fullSizeUrl) {
            setUseFallback(true);
          } else {
            // If we're already using fallback and it still fails, mark as loaded
            // to remove loading indicator
            setImageLoaded(true);
            
            // Track the error for analytics
            trackError("Image load error", "IMAGE_LOAD_ERROR", {
              imageUrl: displayUrl,
              thumbnailUrl,
              fullSizeUrl
            });
          }
        }}
      />
      
      {/* Loading background while image is loading */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      
      {/* Show error state if both primary and fallback images fail */}
      {loadError && useFallback && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-400">
            <Image size={32} className="mb-2" />
            <span className="text-xs">Image unavailable</span>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <LoadingSpinner />
        </div>
      )}

      {/* Color variant indicator - with improved visibility and badge showing number of variants */}
      {hasVariants && (
        <div 
          className={`absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md cursor-pointer ${
            isMobile ? 'p-2.5' : 'p-1.5' // Larger touch target on mobile
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVariants();
          }}
        >
          <Image size={isMobile ? 20 : 16} className="text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default ProductImage;
