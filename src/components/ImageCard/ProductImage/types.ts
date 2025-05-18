
export interface ProductImageProps {
  thumbnailUrl: string;
  fullSizeUrl?: string;
  title: string;
  isLoading: boolean;
  hasVariants: boolean;
  onToggleVariants: () => void;
  isLoadingProduct: boolean;
  handleClick: () => void;
  colorVariants?: { url: string; color: string }[];
}
