
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
}

export const searchImages = async ({ 
  query, 
  start = 1, 
  num = 10 
}: ImageSearchParams): Promise<ImageSearchResult> => {
  const apiKey = 'AIzaSyCnhfnf18LVDXEWywoRYnTejykVPz_7niI';
  const cx = '2224a95ca357d4e8a';
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${encodeURIComponent(query)}&start=${start}&num=${num}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Failed to fetch images (${response.status})`);
  }
  
  return response.json();
};

