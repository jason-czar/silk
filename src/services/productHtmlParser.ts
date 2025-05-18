
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches product HTML and extracts image URLs
 */
export const fetchProductImagesFromHtml = async (productUrl: string): Promise<string[]> => {
  try {
    console.log('Fetching product images from HTML:', productUrl);
    
    const { data, error } = await supabase.functions.invoke('fetch-product-html', {
      body: { url: productUrl }
    });
    
    if (error) {
      console.error('Error fetching product HTML:', error);
      throw new Error(`HTML extraction error: ${error.message}`);
    }
    
    if (!data || !data.imageUrls || !Array.isArray(data.imageUrls)) {
      console.warn('No image URLs found in HTML response', data);
      return [];
    }
    
    console.log(`Found ${data.imageUrls.length} images from HTML parsing`);
    return data.imageUrls;
  } catch (error) {
    console.error('HTML parsing service error:', error);
    // Return empty array instead of throwing to avoid breaking other functionality
    return [];
  }
};

/**
 * Check if a URL is a DHgate product URL
 */
export const isDHgateProductUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('dhgate.com/product') || url.includes('dhgate.com/p/');
};
