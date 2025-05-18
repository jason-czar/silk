import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getProductByItemcode } from '@/integrations/dhgate/endpoints';
import { DHgateProductResponse } from '@/integrations/dhgate/types';
import { extractItemcode, generateFallbackVariants, getFullSizeGoogleImage, isImageUrl } from './utils';
import { ImageCardProps } from './types';
import { fetchProductImagesFromHtml, isDHgateProductUrl } from '@/services/productHtmlParser';

export const useProductDetails = (item: ImageCardProps['item']) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [fullSizeImage, setFullSizeImage] = useState<string>('');
  const [colorVariants, setColorVariants] = useState<{url: string, color: string}[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [dhgateProduct, setDhgateProduct] = useState<DHgateProductResponse['product'] | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [productImagesLoaded, setProductImagesLoaded] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoadingHtmlImages, setIsLoadingHtmlImages] = useState(false);

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
      
      // Always set fallback variants based on the main image
      // so we have something to display even if API fails
      setColorVariants(generateFallbackVariants(item.image.thumbnailLink));
    }
    
    // If this is a DHgate product, try to fetch additional details
    let itemcode: string | null = null;
    
    // Try multiple places to extract an itemcode
    if (item.link && item.link.includes('dhgate.com')) {
      itemcode = extractItemcode(item.link);
      console.log('Extracted itemcode from link:', itemcode);
    } else if (item.image?.contextLink && item.image.contextLink.includes('dhgate.com')) {
      // If the main link isn't DHgate but the contextLink is, try that instead
      itemcode = extractItemcode(item.image.contextLink);
      console.log('Extracted itemcode from contextLink:', itemcode);
    }
    
    if (itemcode) {
      // Fetch product details from DHgate API
      const fetchProductDetails = async () => {
        setIsLoadingProduct(true);
        setApiError(null);
        
        try {
          const productDetails = await getProductByItemcode(itemcode as string);
          if (productDetails) {
            setDhgateProduct(productDetails);
            
            // Collect all unique images from the product
            const allImages: {url: string, color: string}[] = [];
            const uniqueImageUrls = new Set<string>();
            
            // Function to add an image if it's not a duplicate
            const addUniqueImage = (url: string, name: string) => {
              if (url && !uniqueImageUrls.has(url) && isImageUrl(url)) {
                uniqueImageUrls.add(url);
                allImages.push({
                  url,
                  color: name
                });
              }
            };
            
            // Add the main product image first if available
            if (productDetails.originalImageUrl) {
              addUniqueImage(productDetails.originalImageUrl, 'Main');
              
              // Also update the selected image to use the higher quality original
              setSelectedImage(productDetails.originalImageUrl);
              setFullSizeImage(productDetails.originalImageUrl);
            }
            
            // Add all images from the imageList if available
            if (productDetails.imageList && Array.isArray(productDetails.imageList)) {
              productDetails.imageList.forEach((img, index) => {
                if (img && img.imageUrl) {
                  addUniqueImage(img.imageUrl, `Image ${index + 1}`);
                }
              });
            }
            
            // Then add any variant images from skuProperties
            if (productDetails.skuProperties && Array.isArray(productDetails.skuProperties)) {
              productDetails.skuProperties.forEach((property) => {
                if (property && property.values && Array.isArray(property.values)) {
                  property.values.forEach((value) => {
                    if (value && value.imageUrl) {
                      addUniqueImage(
                        value.imageUrl, 
                        value.propertyValueDisplayName || property.propertyName || 'Variant'
                      );
                    }
                  });
                }
              });
            }
            
            // If we found images, use them
            if (allImages.length > 0) {
              console.log(`Found ${allImages.length} product images for carousel`);
              setColorVariants(allImages);
              setProductImagesLoaded(true);
            }
          }
        } catch (error) {
          console.error('Failed to fetch DHgate product details:', error);
          setApiError(error instanceof Error ? error.message : 'Unknown API error');
          // Don't show error toast to user - just silently fallback to the existing variant
        } finally {
          setIsLoadingProduct(false);
        }
      };
      
      fetchProductDetails();
      
      // Additionally, try to fetch images from HTML
      const fetchHtmlImages = async () => {
        // Get the product URL
        const productUrl = item.link || item.image?.contextLink;
        
        // Only proceed if this is a DHgate URL
        if (productUrl && isDHgateProductUrl(productUrl)) {
          setIsLoadingHtmlImages(true);
          try {
            const htmlImages = await fetchProductImagesFromHtml(productUrl);
            
            if (htmlImages && htmlImages.length > 0) {
              // Create variant objects from HTML images
              const htmlVariants = htmlImages.map((url, index) => ({
                url,
                color: `Image ${index + 1}`
              }));
              
              // Merge with existing variants, preferring HTML images since they're higher quality
              setColorVariants(prevVariants => {
                // Create a combined list with HTML images first
                const combinedVariants = [...htmlVariants];
                
                // Keep track of URLs we've already added
                const addedUrls = new Set(htmlVariants.map(v => v.url));
                
                // Add any previous variants that aren't duplicates
                prevVariants.forEach(variant => {
                  if (!addedUrls.has(variant.url)) {
                    addedUrls.add(variant.url);
                    combinedVariants.push(variant);
                  }
                });
                
                console.log(`Enhanced carousel with ${htmlVariants.length} HTML-parsed images`);
                return combinedVariants;
              });
              
              setProductImagesLoaded(true);
            }
          } catch (error) {
            console.error('Error fetching images from HTML:', error);
            // Silently fail and continue using the API images or fallbacks
          } finally {
            setIsLoadingHtmlImages(false);
          }
        }
      };
      
      fetchHtmlImages();
    }
  }, [item]);

  // Automatically show variants when they're loaded (if we have more than one)
  useEffect(() => {
    if (productImagesLoaded && colorVariants.length > 1) {
      // Only auto-expand if we have multiple images
      setShowVariants(true);
    }
  }, [productImagesLoaded, colorVariants.length]);

  const handleVariantClick = (variantUrl: string) => {
    setSelectedImage(variantUrl);
    
    // When clicking a variant, use it directly as the full size image
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
    productImagesLoaded,
    apiError,
    handleVariantClick,
    toggleVariants,
    isLoadingHtmlImages
  };
};
