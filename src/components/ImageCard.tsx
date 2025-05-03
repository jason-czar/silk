import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
interface ImageCardProps {
  title: string;
  thumbnailUrl: string;
  imageUrl: string;
  contextLink: string;
  width: number;
  height: number;
}
const ImageCard = ({
  title,
  thumbnailUrl,
  imageUrl,
  contextLink,
  width,
  height
}: ImageCardProps) => {
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
      if (contextLink && contextLink.includes('dhgate.com')) {
        // If contextLink is from DHgate, navigate there
        productUrl = contextLink;
      } else if (imageUrl.includes('dhgate.com/product/')) {
        // Fallback to imageUrl if it's a DHgate product page
        productUrl = imageUrl;
      } else if (imageUrl.includes('dhgate.com')) {
        // It's DHgate but not a product page
        productUrl = imageUrl;
      } else {
        // For non-DHgate URLs, search for the product on DHgate
        const searchTerm = encodeURIComponent(title.split(' ').slice(0, 3).join(' '));
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

  // Check if the product is from DHgate
  const isDHgate = contextLink?.includes('dhgate.com') || imageUrl?.includes('dhgate.com');

  // Extract brand name and format price for display
  const brandName = isDHgate ? 'DHgate.com' : extractBrandName(title);
  const truncatedTitle = title.length > 20 ? title.substring(0, 20) + '...' : title;
  const price = generateRandomPrice();
  return <div className="rounded-lg overflow-hidden shadow-md h-full bg-[#ebebeb]">
      <div className="relative pb-[100%] bg-white" onClick={handleClick}>
        <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
          </div>}
      </div>
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
        <p className="text-base font-medium mb-1 truncate">{truncatedTitle}</p>
        {/* Price section hidden as requested */}
        <button onClick={handleClick} className="w-full mt-2 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-100">
          Find similar
        </button>
      </div>
    </div>;
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