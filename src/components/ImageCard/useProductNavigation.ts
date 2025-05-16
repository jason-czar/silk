
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
      // Affiliate URL to track the click
      const affiliateUrl = 'https://sale.dhgate.com/92xVti99';
      
      // Determine the actual product URL
      let productUrl = '';
      if (item.image?.contextLink) {
        productUrl = item.image.contextLink;
      } else if (item.link) {
        productUrl = item.link;
      }

      // Create and open the affiliate window first
      const affiliateWindow = window.open(affiliateUrl, '_blank');
      
      // After a very short delay, redirect the affiliate window to the product URL
      setTimeout(() => {
        if (affiliateWindow && !affiliateWindow.closed) {
          affiliateWindow.location.href = productUrl;
        } else {
          // Fallback in case the popup was blocked
          window.open(productUrl, '_blank', 'noopener,noreferrer');
        }
        setIsLoading(false);
      }, 100); // Very short delay to ensure affiliate tracking works
      
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
