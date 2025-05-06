
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Image, ChevronRight } from 'lucide-react';
import { getProductByItemcode } from '@/integrations/dhgate/client';

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

// Extract DHgate itemcode from URL
const extractItemcode = (url: string): string | null => {
  // Example URL: https://www.dhgate.com/product/2023-tailwind-5-v-men-running-shoes-skepta/886638181.html
  const match = url.match(/\/product\/.*?\/(\d+)\.html/);
  return match ? match[1] : null;
};

// Sample color variants for demonstration
const generateColorVariants = (baseImageUrl: string): {url: string, color: string}[] => {
  // For demo purposes, we'll create some color variants with slight modifications to the URL
  return [
    { url: baseImageUrl, color: 'Gray/Volt' },
    { url: baseImageUrl.replace(/(\.\w+)$/, '-yellow$1'), color: 'Yellow/Black' },
    { url: baseImageUrl.replace(/(\.\w+)$/, '-blue$1'), color: 'Blue/White' },
    { url: baseImageUrl.replace(/(\.\w+)$/, '-red$1'), color: 'Red/Black' },
  ];
};

const ImageCard = ({ item }: ImageCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [colorVariants, setColorVariants] = useState<{url: string, color: string}[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [dhgateProduct, setDhgateProduct] = useState<any>(null);
  
  useEffect(() => {
    // Set the main image when the component mounts
    if (item.image?.thumbnailLink) {
      setSelectedImage(item.image.thumbnailLink);
      
      // Generate simulated color variants based on the main image
      setColorVariants(generateColorVariants(item.image.thumbnailLink));
    }
    
    // If this is a DHgate product, try to fetch additional details
    if (item.link && item.link.includes('dhgate.com/product')) {
      const itemcode = extractItemcode(item.link);
      if (itemcode) {
        // Fetch product details from DHgate API
        const fetchProductDetails = async () => {
          try {
            const productDetails = await getProductByItemcode(itemcode);
            if (productDetails) {
              setDhgateProduct(productDetails);
              
              // If the product has real variants, use those instead of simulated ones
              if (productDetails.skuProperties && productDetails.skuProperties.length > 0) {
                const realVariants = productDetails.skuProperties
                  .flatMap((prop: any) => prop.values)
                  .filter((value: any) => value.imageUrl)
                  .map((value: any) => ({
                    url: value.imageUrl,
                    color: value.propertyValueDisplayName || 'Variant'
                  }));
                
                if (realVariants.length > 0) {
                  setColorVariants(realVariants);
                }
              }
            }
          } catch (error) {
            console.error('Failed to fetch DHgate product details:', error);
            // Fall back to simulated variants - already set above
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
        // Fallback to imageUrl if it's a DHgate product page
        productUrl = item.link;
      } else if (item.link && item.link.includes('dhgate.com')) {
        // It's DHgate but not a product page
        productUrl = item.link;
      } else {
        // For non-DHgate URLs, search for the product on DHgate
        const searchTerm = encodeURIComponent(item.title.split(' ').slice(0, 3).join(' '));
        productUrl = `https://www.dhgate.com/product/search.do?act=search&sus=&searchkey=${searchTerm}`;
      }

      // Set a small timeout to ensure the affiliate link is loaded before navigating
      setTimeout(() => {
        // Remove the iframe
        document.body.removeChild(iframe);

        // Navigate to the product URL
        window.open(productUrl, '_blank', 'noopener,noreferrer');
        setIsLoading(false);
      }, 100);
    } catch (error) {
      console.error('Failed to navigate:', error);
      toast({
        title: "Navigation Error",
        description: "Unable to navigate to DHgate product. Please try again.",
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
  
  // Check if the product is from DHgate
  const isDHgate = contextLink?.includes('dhgate.com') || imageUrl?.includes('dhgate.com');

  // Extract brand name and format price for display
  const brandName = isDHgate ? 'DHgate.com' : extractBrandName(title);
  
  // Clean up the title by removing common prefixes like "Bulk"
  const cleanTitle = cleanProductTitle(title);
  
  // Display the cleaned title with truncation if needed
  const displayTitle = cleanTitle.length > 20 ? cleanTitle.substring(0, 20) + '...' : cleanTitle;
  
  const price = generateRandomPrice();
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md h-full bg-[#ebebeb]">
      <div className="relative pb-[100%] bg-white" onClick={handleClick}>
        <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Color variant indicator - only shows if we have variants */}
        {colorVariants.length > 1 && (
          <div 
            className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowVariants(!showVariants);
            }}
          >
            <Image size={16} className="text-gray-600" />
          </div>
        )}
      </div>

      {/* Color variants carousel - only displayed if showVariants is true */}
      {showVariants && colorVariants.length > 1 && (
        <div className="bg-white p-2" onClick={(e) => e.stopPropagation()}>
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {colorVariants.map((variant, index) => (
                <CarouselItem key={index} className="pl-2 basis-1/3">
                  <div 
                    className={`aspect-square rounded overflow-hidden cursor-pointer border-2 ${selectedImage === variant.url ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => handleVariantClick(variant.url)}
                  >
                    <img src={variant.url} alt={`Color variant ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-end gap-1 mt-1">
              <CarouselPrevious className="static h-6 w-6 translate-y-0 transform-none rounded-full" />
              <CarouselNext className="static h-6 w-6 translate-y-0 transform-none rounded-full" />
            </div>
          </Carousel>
        </div>
      )}

      <div className="p-3 text-white">
        <div className="flex items-center mb-1">
          <Avatar className="h-5 w-5 mr-2">
            {isDHgate ? <AvatarImage src="https://www.dhgate.com/favicon.ico" alt="DHgate" /> : null}
            <AvatarFallback className="text-black text-xs bg-gray-300">
              {isDHgate ? 'D' : brandName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-gray-400 text-sm">{brandName}</span>
        </div>
        <p className="text-base font-medium mb-1 truncate text-[#2C2C2C]">{displayTitle}</p>
        {/* Price section hidden as requested */}
        <button onClick={handleClick} className="w-full mt-2 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-100">View product</button>
      </div>
    </div>
  );
};

// Helper function to clean up product titles by removing common prefixes
const cleanProductTitle = (title: string): string => {
  // List of common prefixes to remove
  const prefixesToRemove = ['Bulk', 'Wholesale', 'Hot Sale', 'New'];
  
  let cleanedTitle = title.trim();
  
  // Check if title starts with any of the prefixes (case insensitive)
  for (const prefix of prefixesToRemove) {
    const regexPattern = new RegExp(`^${prefix}\\s+`, 'i');
    if (regexPattern.test(cleanedTitle)) {
      cleanedTitle = cleanedTitle.replace(regexPattern, '');
    }
  }
  
  return cleanedTitle;
};

// Helper function to extract brand name from title
const extractBrandName = (title: string): string => {
  const commonBrands = ['Gucci', 'Nike', 'Adidas', 'Amazon', 'Apple', 'Samsung', 'Sony'];
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  // Return first word if no known brand is found
  return title.split(' ')[0];
};

// Helper function to generate a random price for demo purposes
const generateRandomPrice = (): string => {
  const basePrice = Math.floor(Math.random() * 200) + 50;
  return basePrice.toString();
};

export default ImageCard;
