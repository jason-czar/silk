import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ImageCardProps } from './types';

export const useProductNavigation = (item: ImageCardProps['item']) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Determine if this is a DHgate product
      const isDHgateProduct = item.link && item.link.includes('dhgate.com');
      
      if (isDHgateProduct) {
        // For DHgate products, use the existing affiliate link logic
        // First, create an invisible iframe to load the affiliate link
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'https://sale.dhgate.com/92xVti99';
        document.body.appendChild(iframe);
        
        // Then determine the actual product URL
        let productUrl = item.link;
        
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
        let productUrl = '';
        
        // Choose the best URL to navigate to
        if (item.image?.contextLink) {
          // Use the contextLink if available
          productUrl = item.image.contextLink;
        } else if (item.link) {
          // Otherwise use the direct item link
          productUrl = item.link;
        }
        
        window.open(productUrl, '_blank', 'noopener,noreferrer');
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

  return {
    isLoading,
    handleClick
  };
};
