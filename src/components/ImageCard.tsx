
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';

interface ImageCardProps {
  title: string;
  thumbnailUrl: string;
  imageUrl: string;
  width: number;
  height: number;
}

const ImageCard = ({ 
  title, 
  thumbnailUrl, 
  imageUrl, 
  width, 
  height 
}: ImageCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if the URL is from DHgate and specifically a product page
      const isDHgateProduct = imageUrl.includes('dhgate.com/product/');
      
      if (isDHgateProduct) {
        // Navigate directly to the DHgate product page
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
      } else if (imageUrl.includes('dhgate.com')) {
        // It's DHgate but not a product page, try to find product link
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
      } else {
        // For non-DHgate URLs, search for the product on DHgate
        const searchTerm = encodeURIComponent(title.split(' ').slice(0, 3).join(' '));
        const dhgateSearchUrl = `https://www.dhgate.com/product/search.do?act=search&sus=&searchkey=${searchTerm}`;
        window.open(dhgateSearchUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
      toast({
        title: "Navigation Error",
        description: "Unable to navigate to DHgate product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="rounded-lg overflow-hidden shadow-md h-full bg-white image-card-hover cursor-pointer transition-transform hover:scale-105"
    >
      <div className="relative pb-[100%]">
        <img
          src={thumbnailUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      <div className="p-2 text-sm text-center truncate">
        <span className="text-primary font-medium">View on DHgate</span>
      </div>
    </div>
  );
};

export default ImageCard;
