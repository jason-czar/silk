
import { formatDHgateProductsAsImageResults, searchDHgate } from "./dhgateSearch";
import { trackError, trackEvent } from "@/services/analytics";

export interface ImageSearchResult {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      totalResults: string;
    }>;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items: Array<{
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    mime: string;
    fileFormat: string;
    image: {
      contextLink: string;
      height: number;
      width: number;
      byteSize: number;
      thumbnailLink: string;
      thumbnailHeight: number;
      thumbnailWidth: number;
    };
  }>;
}

export interface ImageSearchParams {
  query: string;
  start?: number;
  num?: number;
  useDHgate?: boolean; // Parameter to determine search source
  preferHighQuality?: boolean; // New parameter to control image quality preference
}

export const searchImages = async ({ 
  query, 
  start = 1, 
  num = 12,
  useDHgate = false,
  preferHighQuality = true // Default to preferring higher quality images
}: ImageSearchParams): Promise<ImageSearchResult> => {
  const searchStartTime = Date.now();
  let searchSource = 'google';
  
  try {
    // First try to search directly on DHgate if the flag is set
    if (useDHgate) {
      try {
        searchSource = 'dhgate';
        // Convert start/num to DHgate pagination
        const page = Math.ceil(start / num);
        const pageSize = num;
        
        console.log(`Searching DHgate for "${query}" (page ${page}, size ${pageSize})`);
        const dhgateResults = await searchDHgate(query, page, pageSize);
        
        // Track successful search
        const searchDuration = (Date.now() - searchStartTime) / 1000;
        trackSearchQuery(query, dhgateResults.items.length, {
          source: searchSource,
          duration: searchDuration,
          success: true
        });
        
        return formatDHgateProductsAsImageResults(dhgateResults) as ImageSearchResult;
      } catch (error) {
        console.error('DHgate search failed, falling back to Google:', error);
        searchSource = 'google_fallback';
        trackError('DHgate search failed', 'DHGATE_SEARCH_ERROR', { 
          query,
          error: error instanceof Error ? error.message : String(error)
        });
        // If DHgate search fails, fall back to Google search
      }
    }
    
    // Otherwise use Google search (or as fallback)
    const apiKey = 'AIzaSyCnhfnf18LVDXEWywoRYnTejykVPz_7niI';
    const cx = '2224a95ca357d4e8a';
    
    console.log(`Searching Google for "${query}" (start ${start}, num ${num})`);
    
    // Build the URL with optimized parameters for image quality
    // We've removed imgSize=large but added other quality-enhancing parameters
    let url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${encodeURIComponent(query)}&start=${start}&num=${num}`;
    
    // Apply quality parameters based on preference
    if (preferHighQuality) {
      // Add parameters that encourage higher quality images:
      // - imgType=photo tends to return higher quality photographic images
      // - rights=cc_publicdomain often returns professional images
      url += '&imgType=photo&rights=cc_publicdomain';
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = error.error?.message || `Failed to fetch images (${response.status})`;
        
        trackError('Google search failed', 'GOOGLE_SEARCH_ERROR', {
          query,
          status: response.status,
          errorDetails: error.error
        });
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Apply client-side filtering for minimum image quality
      if (preferHighQuality && result.items?.length) {
        result.items = filterLowQualityImages(result.items);
      }
      
      // Track successful search
      const searchDuration = (Date.now() - searchStartTime) / 1000;
      trackSearchQuery(query, result.items?.length || 0, {
        source: searchSource,
        duration: searchDuration,
        success: true,
        qualityFilter: preferHighQuality
      });
      
      return result;
    } catch (error) {
      console.error('Google image search error:', error);
      
      // Track search error
      trackError('Google search error', 'GOOGLE_SEARCH_ERROR', {
        query,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // If it's an abort error, provide a more user-friendly message
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Search request timed out. Please try again.');
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to search for images');
    }
  } catch (error) {
    // Track overall search failure
    trackError('Search failed', 'SEARCH_ERROR', {
      query,
      source: searchSource,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw error;
  }
};

// Helper function to filter out low quality images based on dimensions and size
function filterLowQualityImages(items: any[]) {
  const MIN_WIDTH = 400;  // Minimum acceptable width
  const MIN_HEIGHT = 400; // Minimum acceptable height
  
  return items.filter(item => {
    // Skip items without image data
    if (!item.image) return false;
    
    // Check dimensions against thresholds
    const width = item.image.width || 0;
    const height = item.image.height || 0;
    
    return width >= MIN_WIDTH && height >= MIN_HEIGHT;
  });
}

// Helper function for trackSearch with additional params - renamed to avoid conflicts
function trackSearchQuery(query: string, resultCount: number, additionalData?: Record<string, any>) {
  const data = { query, resultCount, ...additionalData };
  // Call the event tracking with the search data
  trackEvent('search', data);
}
