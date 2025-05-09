
import { cleanProductTitle, extractBrandName, getProductSource } from './utils';
import { useProductDetails } from './useProductDetails';
import { useProductNavigation } from './useProductNavigation';
import ProductImage from './ProductImage';
import ImageCarousel from './ImageCarousel';
import ProductInfo from './ProductInfo';
import { ImageCardProps } from './types';

const ImageCard = ({ item }: ImageCardProps) => {
  // Get product details and functionality
  const {
    selectedImage,
    colorVariants,
    showVariants,
    isLoadingProduct,
    handleVariantClick,
    toggleVariants
  } = useProductDetails(item);
  
  // Get navigation functionality
  const { isLoading, handleClick } = useProductNavigation(item);

  // Extract relevant data from the item
  const title = item.title || '';
  const thumbnailUrl = selectedImage || item.image?.thumbnailLink || '';
  const imageUrl = item.link || '';
  const contextLink = item.image?.contextLink || '';
  
  // Get the product source
  const productSource = getProductSource(item.link || contextLink || '');
  
  // Clean up the title by removing common prefixes like "Bulk"
  const cleanTitle = cleanProductTitle(title);
  
  // Display the cleaned title with truncation if needed
  const displayTitle = cleanTitle.length > 20 ? cleanTitle.substring(0, 20) + '...' : cleanTitle;
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md h-full bg-[#ebebeb]">
      <ProductImage 
        thumbnailUrl={thumbnailUrl}
        title={title}
        isLoading={isLoading}
        hasVariants={colorVariants.length > 1}
        onToggleVariants={toggleVariants}
        isLoadingProduct={isLoadingProduct}
        handleClick={handleClick}
      />

      {/* Color variants carousel - only displayed if showVariants is true */}
      {showVariants && (
        <ImageCarousel 
          variants={colorVariants}
          selectedImage={selectedImage}
          onVariantClick={handleVariantClick}
        />
      )}

      <ProductInfo 
        brandName={extractBrandName(title)}
        source={productSource}
        displayTitle={displayTitle}
        handleClick={handleClick}
      />
    </div>
  );
};

export default ImageCard;
