
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';

interface ImageCardProps {
  title: string;
  thumbnailUrl: string;
  imageUrl: string;
  contextLink: string; // Add the contextLink from API response
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
  const { toast } = useToast();
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
        variant: "destructive",
      });
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
      {/* The text section below has been removed */}
    </div>
  );
};

export default ImageCard;
