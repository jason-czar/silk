
import React from 'react';
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
  if (variants.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white p-2" onClick={(e) => e.stopPropagation()}>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {variants.map((variant, index) => (
            <CarouselItem key={index} className="pl-2 basis-1/3">
              <CarouselItemVariant 
                variant={variant}
                isSelected={selectedImage === variant.url}
                onClick={() => onVariantClick(variant.url)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {variants.length > 3 && (
          <div className="flex items-center justify-end gap-1 mt-1">
            <CarouselPrevious className="static h-6 w-6 translate-y-0 transform-none rounded-full" />
            <CarouselNext className="static h-6 w-6 translate-y-0 transform-none rounded-full" />
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;
