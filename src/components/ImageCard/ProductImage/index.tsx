
import React, { useState, useEffect } from 'react';
import { Image, ChevronLeft, ChevronRight } from 'lucide-react';
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
  handleClick,
  colorVariants = []
}: ProductImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useIsMobile();
  
  // Get all available images for carousel
  const carouselImages = colorVariants.length > 0 
    ? colorVariants.map(variant => variant.url)
    : [fullSizeUrl || thumbnailUrl].filter(Boolean);
  
  // Use the full size URL if provided, otherwise fall back to thumbnail
  const displayUrl = useFallback ? thumbnailUrl : (carouselImages[currentImageIndex] || fullSizeUrl || thumbnailUrl);
  
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
    
    console.log('Carousel images available:', carouselImages.length);
  }, [fullSizeUrl, thumbnailUrl, carouselImages]);

  // Navigation functions
  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering handleClick
    if (carouselImages.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering handleClick
    if (carouselImages.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
      );
    }
  };

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
        decoding="async"
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
      
      {/* Navigation arrows - only visible on desktop */}
      {!isMobile && carouselImages.length > 1 && (
        <>
          <button 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md z-10 hover:bg-white transition-colors"
            onClick={goToPreviousImage}
            aria-label="Previous image"
          >
            <ChevronLeft size={16} className="text-gray-700" />
          </button>
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md z-10 hover:bg-white transition-colors"
            onClick={goToNextImage}
            aria-label="Next image"
          >
            <ChevronRight size={16} className="text-gray-700" />
          </button>
          
          {/* Image counter indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {carouselImages.map((_, index) => (
              <div 
                key={index}
                className={`w-1.5 h-1.5 rounded-full bg-white ${
                  index === currentImageIndex 
                    ? 'opacity-100 scale-125' 
                    : 'opacity-60'
                } shadow-sm transition-all duration-200`}
              />
            ))}
          </div>
        </>
      )}
      
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
