
import { formatDHgateProductsAsImageResults, searchDHgate } from "./dhgateSearch";

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
  useDHgate?: boolean; // New parameter to determine search source
}

// Helper function to get high quality image URL
export const getHighQualityImageUrl = (url: string): string => {
  if (!url) return url;
  
  // For Google image search results
  if (url.includes('googleusercontent.com')) {
    // Remove any size restrictions in the URL
    return url.replace(/=w\d+-h\d+/, '=w1000-h1000').replace(/=s\d+/, '=s1000');
  }
  
  // For DHgate images, increase the size parameter if present
  if (url.includes('dhgate.com')) {
    // DHgate often uses patterns like ...200x200.jpg or ...200x200_1.jpg
    return url.replace(/(\d+)x(\d+)((_\d+)?\.jpg)/, '800x800$3');
  }
  
  return url;
}

export const searchImages = async ({ 
  query, 
  start = 1, 
  num = 10,
  useDHgate = false
}: ImageSearchParams): Promise<ImageSearchResult> => {
  // First try to search directly on DHgate if the flag is set
  if (useDHgate) {
    try {
      // Convert start/num to DHgate pagination
      const page = Math.ceil(start / num);
      const pageSize = num;
      
      const dhgateResults = await searchDHgate(query, page, pageSize);
      return formatDHgateProductsAsImageResults(dhgateResults) as ImageSearchResult;
    } catch (error) {
      console.error('DHgate search failed, falling back to Google:', error);
      // If DHgate search fails, fall back to Google search
    }
  }
  
  // Otherwise use Google search (or as fallback)
  const apiKey = 'AIzaSyCnhfnf18LVDXEWywoRYnTejykVPz_7niI';
  const cx = '2224a95ca357d4e8a';
  
  // Add imgSize=huge to get higher resolution images
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&imgSize=large&q=${encodeURIComponent(query)}&start=${start}&num=${num}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Failed to fetch images (${response.status})`);
  }
  
  return response.json();
};

