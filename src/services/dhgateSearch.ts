
import { dhgateApiRequest, searchDHgateProducts } from "@/integrations/dhgate/client";
import { toast } from "@/components/ui/use-toast";

export interface DHgateProduct {
  itemCode: string;
  itemName: string;
  price: {
    maxPrice: number;
    minPrice: number;
    currency: string;
  };
  imageUrl: string;
  productUrl: string;
  sellerId: string;
  sellerName: string;
  categoryId: string;
  categoryName: string;
}

export interface DHgateSearchResult {
  totalItem: number;
  totalPage: number;
  pageSize: number;
  pageNum: number;
  items: DHgateProduct[];
}

/**
 * Search products directly on DHgate with improved error handling
 */
export const searchDHgate = async (
  query: string, 
  page: number = 1, 
  pageSize: number = 20
): Promise<DHgateSearchResult> => {
  let retries = 0;
  const maxRetries = 1;
  
  while (retries <= maxRetries) {
    try {
      const result = await searchDHgateProducts(query, page, pageSize);
      
      // DHgate API response structure might need adaptation
      // Handle the case where properties might be missing
      return {
        totalItem: result.totalItem || 0,
        totalPage: result.totalPage || 0,
        pageSize: result.pageSize || pageSize,
        pageNum: result.pageNum || page,
        items: result.items || []
      };
    } catch (error) {
      retries++;
      console.error(`DHgate search error (attempt ${retries}):`, error);
      
      // If we have more retries left, wait and try again
      if (retries <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        continue;
      }
      
      // Maximum retries reached, throw error
      throw new Error(error instanceof Error ? error.message : 'Failed to search DHgate products');
    }
  }
  
  // This should never happen but TypeScript requires it
  throw new Error(`Failed to search DHgate products after ${maxRetries} retries`);
};

/**
 * Format DHgate products to match ImageSearchResult format 
 * so they can be displayed in the same UI
 */
export const formatDHgateProductsAsImageResults = (dhgateResults: DHgateSearchResult) => {
  // Convert DHgate products to the format expected by ImageGrid
  return {
    kind: "customsearch#search",
    url: {
      type: "application/json",
      template: `${window.location.origin}/dhgate-search`
    },
    queries: {
      request: [{
        totalResults: dhgateResults.totalItem.toString()
      }]
    },
    searchInformation: {
      searchTime: 0,
      formattedSearchTime: "0",
      totalResults: dhgateResults.totalItem.toString(),
      formattedTotalResults: dhgateResults.totalItem.toLocaleString()
    },
    items: dhgateResults.items.map(product => ({
      kind: "customsearch#result",
      title: product.itemName,
      htmlTitle: product.itemName,
      link: product.productUrl,
      displayLink: "www.dhgate.com",
      snippet: product.itemName,
      htmlSnippet: product.itemName,
      mime: "image/jpeg",
      fileFormat: "image/jpeg",
      image: {
        contextLink: product.productUrl,
        height: 800,
        width: 800,
        byteSize: 10000, // Placeholder
        thumbnailLink: product.imageUrl,
        thumbnailHeight: 143,
        thumbnailWidth: 143
      }
    }))
  };
};
