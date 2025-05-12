
import { ImageCardProps } from './types';
import { useProductDetails } from './useProductDetails';
import { useProductNavigation } from './useProductNavigation';
import ProductImage from './ProductImage';
import ImageCarousel from './ImageCarousel';
import ProductInfo from './ProductInfo';
import { cleanProductTitle, extractBrandName, getProductSource } from './utils';

const ImageCard = ({ item }: ImageCardProps) => {
  // Get product details and functionality
  const {
    selectedImage,
    fullSizeImage,
    colorVariants,
    showVariants,
    isLoadingProduct,
    productImagesLoaded,
    handleVariantClick,
    toggleVariants
  } = useProductDetails(item);
  
  // Get navigation functionality
  const { isLoading, handleClick } = useProductNavigation(item);

  // Extract relevant data from the item
  const title = item.title || '';
  const thumbnailUrl = selectedImage || item.image?.thumbnailLink || '';
  const contextLink = item.image?.contextLink || '';
  
  // Get the product source
  const productSource = getProductSource(item.link || contextLink || '');
  
  // Clean up the title by removing common prefixes like "Bulk"
  const cleanTitle = cleanProductTitle(title);
  
  // Display the cleaned title with truncation if needed - UPDATED from 20 to 30 characters
  const displayTitle = cleanTitle.length > 30 ? cleanTitle.substring(0, 30) + '...' : cleanTitle;
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md h-full bg-[#ebebeb]">
      <ProductImage 
        thumbnailUrl={thumbnailUrl}
        fullSizeUrl={fullSizeImage}
        title={title}
        isLoading={isLoading}
        hasVariants={colorVariants.length > 1}
        onToggleVariants={toggleVariants}
        isLoadingProduct={isLoadingProduct}
        handleClick={handleClick}
      />

      {/* Color variants carousel - displayed if showVariants is true or if we have images from API */}
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
