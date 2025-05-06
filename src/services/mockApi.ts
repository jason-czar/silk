
import { DHgateProduct } from "./dhgateSearch";

// Mock data for similar products
export const getMockSimilarProducts = async (
  searchQuery: string,
  limit: number = 12
): Promise<{ items: DHgateProduct[] }> => {
  // In a real app, this would be an API call to your backend,
  // which would then fetch data from DHgate or process scraped data
  
  // For now, we'll return mock data
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Create mock products based on the search query
      const mockItems: DHgateProduct[] = Array.from({ length: limit }).map((_, i) => {
        const itemCode = Math.floor(100000000 + Math.random() * 900000000).toString();
        return {
          itemCode,
          itemName: `${searchQuery} - Similar Product ${i + 1}`,
          price: {
            minPrice: 10 + Math.random() * 90,
            maxPrice: 100 + Math.random() * 900,
            currency: 'USD'
          },
          imageUrl: `https://picsum.photos/seed/${itemCode}/400/400`,
          productUrl: `https://www.dhgate.com/product/similar-item-${i + 1}/${itemCode}.html`,
          sellerId: `seller${i}`,
          sellerName: `Seller ${i + 1}`,
          categoryId: "12345",
          categoryName: "Similar Products"
        };
      });
      
      resolve({ items: mockItems });
    }, 500);
  });
};

// Helper function to create custom fetch response for mocked API endpoints
export const createMockResponse = (data: any): Response => {
  return {
    json: async () => data,
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    url: '',
    type: 'basic',
    redirected: false,
    text: async () => JSON.stringify(data),
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData()
  } as Response;
};
