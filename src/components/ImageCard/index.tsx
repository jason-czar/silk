
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getProductByItemcode, DHgateProductResponse } from '@/integrations/dhgate/client';
import ProductImage from './ProductImage';
import ImageCarousel from './ImageCarousel';
import ProductInfo from './ProductInfo';
import { cleanProductTitle, extractBrandName, extractItemcode, getProductSource, generateFallbackVariants } from './utils';

interface ImageCardProps {
  item: {
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    mime?: string;
    fileFormat?: string;
    image?: {
      contextLink: string;
      height: number;
      width: number;
      byteSize: number;
      thumbnailLink: string;
      thumbnailHeight: number;
      thumbnailWidth: number;
    };
  };
}

const ImageCard = ({ item }: ImageCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [colorVariants, setColorVariants] = useState<{url: string, color: string}[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [dhgateProduct, setDhgateProduct] = useState<DHgateProductResponse['product'] | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  
  useEffect(() => {
    // Set the main image when the component mounts
    if (item.image?.thumbnailLink) {
      setSelectedImage(item.image.thumbnailLink);
      
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
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get the product source from the URL
      const productSource = getProductSource(item.link);
      
      if (productSource === 'DHgate') {
        // For DHgate products, use the existing affiliate link logic
        // First, create an invisible iframe to load the affiliate link
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'https://sale.dhgate.com/92xVti99';
        document.body.appendChild(iframe);
        
        // Then determine the actual product URL
        let productUrl = '';
        if (item.image?.contextLink && item.image.contextLink.includes('dhgate.com')) {
          // If contextLink is from DHgate, navigate there
          productUrl = item.image.contextLink;
        } else if (item.link && item.link.includes('dhgate.com/product/')) {
          // Use the direct product link
          productUrl = item.link;
        } else {
          // It's DHgate but not a direct product page, use the link anyway
          productUrl = item.link;
        }
        
        // Set a small timeout to ensure the affiliate link is loaded before navigating
        setTimeout(() => {
          // Remove the iframe
          document.body.removeChild(iframe);
          
          // Navigate to the product URL
          window.open(productUrl, '_blank', 'noopener,noreferrer');
          setIsLoading(false);
        }, 100);
      } else {
        // For non-DHgate products, navigate directly to the product URL
        window.open(item.link, '_blank', 'noopener,noreferrer');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
      toast({
        title: "Navigation Error",
        description: "Unable to navigate to product page. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

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
        onToggleVariants={() => setShowVariants(!showVariants)}
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
