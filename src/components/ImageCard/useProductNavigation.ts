import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ImageCardProps } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

export const useProductNavigation = (item: ImageCardProps['item']) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent default only if it's not a mobile device to avoid interference with touch events
    if (!isMobile) {
      e.preventDefault();
    }
    
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

      // For mobile devices, navigate directly to product URL with affiliate tracking
      if (isMobile) {
        // Open the product URL directly
        window.open(productUrl, '_blank', 'noopener,noreferrer');
        
        // Use a hidden iframe for affiliate tracking instead of redirecting the user
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = affiliateUrl;
        document.body.appendChild(iframe);
        
        // Remove the iframe after a short period
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsLoading(false);
        }, 100);
      } else {
        // Desktop behavior - keep existing approach
        const affiliateWindow = window.open(affiliateUrl, '_blank');
        
        setTimeout(() => {
          if (affiliateWindow && !affiliateWindow.closed) {
            affiliateWindow.location.href = productUrl;
          } else {
            // Fallback in case the popup was blocked
            window.open(productUrl, '_blank', 'noopener,noreferrer');
          }
          setIsLoading(false);
        }, 100);
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

  // Add touch event handler specifically for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      // Don't prevent default here to allow normal touch behavior
      handleClick(e as unknown as React.MouseEvent);
    }
  };

  return {
    isLoading,
    handleClick,
    handleTouchStart
  };
};
