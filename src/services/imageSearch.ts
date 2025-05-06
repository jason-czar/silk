
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
  useDHgate?: boolean;
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
  
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${encodeURIComponent(query)}&start=${start}&num=${num}`;
    
    const controller = new AbortController();
    // Set a timeout for the fetch request
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Failed to fetch images (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Google search error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Search request timed out. Please try again.');
    }
    
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch images');
  }
};
