
import { dhgateApiRequest, searchDHgateProducts } from "@/integrations/dhgate/client";

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
 * Search products directly on DHgate
 */
export const searchDHgate = async (
  query: string, 
  page: number = 1, 
  pageSize: number = 20
): Promise<DHgateSearchResult> => {
  try {
    const result = await searchDHgateProducts(query, page, pageSize);
    
    // DHgate API response structure might need adaptation
    // This is a placeholder for the actual response structure
    return {
      totalItem: result.totalItem || 0,
      totalPage: result.totalPage || 0,
      pageSize: result.pageSize || pageSize,
      pageNum: result.pageNum || page,
      items: result.items || []
    };
  } catch (error) {
    console.error('DHgate search error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to search DHgate products');
  }
};

/**
 * Format DHgate products to match ImageSearchResult format 
 * so they can be displayed in the same UI
 */
export const formatDHgateProductsAsImageResults = (dhgateResults: DHgateSearchResult) => {
  // Convert DHgate products to the format expected by ImageGrid
  return {
    kind: "customsearch#search",
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
