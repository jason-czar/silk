
export interface ProductImageProps {
  thumbnailUrl: string;
  fullSizeUrl?: string;
  title: string;
  isLoading: boolean;
  hasVariants: boolean;
  onToggleVariants: () => void;
  isLoadingProduct: boolean;
  handleClick: (e: React.MouseEvent) => void;
  colorVariants?: { url: string; color: string }[];
}
