
import { useState } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

interface ImageVariant {
  url: string;
  color: string;
}

interface ImageCarouselProps {
  variants: ImageVariant[];
  selectedImage: string;
  onVariantClick: (variantUrl: string) => void;
}

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
              <div 
                className={`aspect-square rounded overflow-hidden cursor-pointer border-2 ${selectedImage === variant.url ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => onVariantClick(variant.url)}
              >
                <img src={variant.url} alt={`${variant.color}`} className="w-full h-full object-cover" />
              </div>
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
