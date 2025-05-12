
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getProductByItemcode, DHgateProductResponse } from '@/integrations/dhgate/client';
import { extractItemcode, generateFallbackVariants, getFullSizeGoogleImage } from './utils';
import { ImageCardProps } from './types';

export const useProductDetails = (item: ImageCardProps['item']) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [fullSizeImage, setFullSizeImage] = useState<string>('');
  const [colorVariants, setColorVariants] = useState<{url: string, color: string}[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [dhgateProduct, setDhgateProduct] = useState<DHgateProductResponse['product'] | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  useEffect(() => {
    // Set the main image when the component mounts
    if (item.image?.thumbnailLink) {
      // Set the thumbnail for initial display (for faster loading)
      setSelectedImage(item.image.thumbnailLink);
      
      // For Google search results, use the direct link to the image (item.link) 
      // as it points to the full-size image
      if (item.link) {
        console.log('Using direct link for full-size image:', item.link);
        setFullSizeImage(item.link);
      } else {
        // Fallback to the transformation method if link is not available
        const fullSize = getFullSizeGoogleImage(item.image.thumbnailLink);
        console.log('Using transformed thumbnail for full-size image:', fullSize);
        setFullSizeImage(fullSize);
      }
      
      // Set a fallback variant based on the main image
      setColorVariants(generateFallbackVariants(item.image.thumbnailLink));
    }
    
    // If this is a DHgate product, try to fetch additional details
    if (item.link && item.link.includes('dhgate.com/product')) {
      const itemcode = extractItemcode(item.link);
      if (itemcode) {
        // Fetch product details from DHgate API
        const fetchProductDetails = async () => {
          setIsLoadingProduct(true);
          try {
            const productDetails = await getProductByItemcode(itemcode);
            if (productDetails) {
              setDhgateProduct(productDetails);
              
              // First collect all images from the imageList if available
              const allImages: {url: string, color: string}[] = [];
              
              // Add the main product image first if available
              if (productDetails.originalImageUrl) {
                allImages.push({
                  url: productDetails.originalImageUrl,
                  color: 'Main'
                });
                setSelectedImage(productDetails.originalImageUrl);
              }
              
              // Add all images from the imageList if available
              if (productDetails.imageList && Array.isArray(productDetails.imageList)) {
                productDetails.imageList.forEach((img, index) => {
                  if (img && img.imageUrl) {
                    allImages.push({
                      url: img.imageUrl,
                      color: `Image ${index + 1}`
                    });
                  }
                });
              }
              
              // Then add any variant images from skuProperties
              if (productDetails.skuProperties && Array.isArray(productDetails.skuProperties)) {
                productDetails.skuProperties.forEach((property) => {
                  if (property && property.values && Array.isArray(property.values)) {
                    property.values.forEach((value) => {
                      if (value && value.imageUrl) {
                        // Check if this image URL is already in our collection
                        const exists = allImages.some(img => img.url === value.imageUrl);
                        if (!exists) {
                          allImages.push({
                            url: value.imageUrl,
                            color: value.propertyValueDisplayName || property.propertyName || 'Variant'
                          });
                        }
                      }
                    });
                  }
                });
              }
              
              // If we found images, use them
              if (allImages.length > 0) {
                console.log(`Found ${allImages.length} product images for carousel`);
                setColorVariants(allImages);
              }
            }
          } catch (error) {
            console.error('Failed to fetch DHgate product details:', error);
            // Fallback to the existing variant
          } finally {
            setIsLoadingProduct(false);
          }
        };
        
        fetchProductDetails();
      }
    }
  }, [item]);

  const handleVariantClick = (variantUrl: string) => {
    setSelectedImage(variantUrl);
    
    // When clicking a variant, try to use it directly as the full size image
    // instead of trying to transform it
    setFullSizeImage(variantUrl);
  };

  const toggleVariants = () => {
    setShowVariants(!showVariants);
  };

  return {
    isLoading,
    setIsLoading,
    selectedImage,
    fullSizeImage,
    colorVariants,
    showVariants,
    dhgateProduct,
    isLoadingProduct,
    handleVariantClick,
    toggleVariants
  };
};
