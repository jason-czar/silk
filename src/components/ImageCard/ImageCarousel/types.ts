
export interface ImageVariant {
  url: string;
  color: string;
}

export interface ImageCarouselProps {
  variants: ImageVariant[];
  selectedImage: string;
  onVariantClick: (variantUrl: string) => void;
}
