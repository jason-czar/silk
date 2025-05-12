
import React, { useRef, useEffect } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { ImageCarouselProps } from './types';
import CarouselItemVariant from './CarouselItemVariant';

const ImageCarousel = ({ variants, selectedImage, onVariantClick }: ImageCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Find the index of the selected image
  const selectedIndex = variants.findIndex(variant => variant.url === selectedImage);
  
  // Effect to scroll the selected image into view when it changes
  useEffect(() => {
    if (selectedIndex >= 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const items = container.querySelectorAll('[role="group"]');
      
      if (items[selectedIndex]) {
        // Scroll the selected item into view
        items[selectedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedIndex]);

  if (variants.length <= 1) {
    return null;
  }

  return (
    <div 
      className="bg-white p-2" 
      onClick={(e) => e.stopPropagation()} 
      ref={scrollContainerRef}
    >
      <Carousel
        opts={{
          align: "start",
          loop: variants.length > 3, // Enable loop only if we have enough items
          dragFree: true, // Enable free-form dragging for more natural swipe
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {variants.map((variant, index) => (
            <CarouselItem key={index} className="pl-2 basis-1/4 md:basis-1/5 lg:basis-1/6">
              <CarouselItemVariant 
                variant={variant}
                isSelected={selectedImage === variant.url}
                onClick={() => onVariantClick(variant.url)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {variants.length > 4 && (
          <div className="flex items-center justify-end gap-1 mt-1">
            <CarouselPrevious className="static h-6 w-6 translate-y-0 transform-none rounded-full" />
            <CarouselNext className="static h-6 w-6 translate-y-0 transform-none rounded-full" />
          </div>
        )}
      </Carousel>
      
      {/* Show the number of images available */}
      <div className="text-xs text-gray-500 text-center mt-1">
        {variants.length} {variants.length === 1 ? 'image' : 'images'} available
      </div>
    </div>
  );
};

export default ImageCarousel;
