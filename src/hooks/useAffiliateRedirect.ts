
import { useEffect } from 'react';

type AffiliateRedirectProps = {
  url: string;
  enabled?: boolean;
  delay?: number;
};

export const useAffiliateRedirect = ({ 
  url, 
  enabled = false, 
  delay = 500 
}: AffiliateRedirectProps) => {
  useEffect(() => {
    if (!enabled || !url) return;

    // Create a hidden iframe for affiliate tracking
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    
    // Track if iframe was appended to prevent removal errors
    let iframeAppended = false;
    
    // Add to DOM
    const appendIframe = () => {
      if (document.body) {
        document.body.appendChild(iframe);
        iframeAppended = true;
      }
    };
    
    // Set a timer to add the iframe after a delay
    const timer = setTimeout(() => {
      appendIframe();
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (iframeAppended && iframe.parentNode) {
          try {
            document.body.removeChild(iframe);
          } catch (error) {
            console.error('Error removing affiliate iframe:', error);
          }
        }
      }, 10000);
      
    }, delay);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      
      // Clean up iframe if it exists and was appended
      if (iframeAppended && iframe.parentNode) {
        try {
          document.body.removeChild(iframe);
        } catch (error) {
          console.error('Error removing affiliate iframe during cleanup:', error);
        }
      }
    };
  }, [url, enabled, delay]);
};
