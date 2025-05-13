
import { useEffect, useState } from 'react';

interface AffiliateRedirectOptions {
  enabled?: boolean;
  delay?: number;
  url: string;
}

export const useAffiliateRedirect = ({
  enabled = true,
  delay = 100, // Very short delay to make it appear seamless
  url
}: AffiliateRedirectOptions) => {
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!enabled || hasRedirected) return;
    
    // Create a hidden iframe to load the affiliate link in the background
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0.01';
    iframe.style.zIndex = '-1';
    iframe.src = url;
    
    const timeoutId = setTimeout(() => {
      // Append iframe to the document
      document.body.appendChild(iframe);
      
      // Mark as redirected
      setHasRedirected(true);
      
      // Clean up iframe after a short period
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }, delay);
    
    return () => {
      clearTimeout(timeoutId);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };
  }, [enabled, hasRedirected, url, delay]);

  return { hasRedirected };
};
