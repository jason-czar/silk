
export interface ProductImageProps {
  thumbnailUrl: string;
  title: string;
  isLoading: boolean;
  hasVariants: boolean;
  onToggleVariants: () => void;
  isLoadingProduct: boolean;
  handleClick: (e: React.MouseEvent) => void;
}
