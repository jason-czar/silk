
import { getMockSimilarProducts, createMockResponse } from '../services/mockApi';

// This is a simple mock API interceptor for development purposes
// In a production environment, you would replace this with real API calls
const originalFetch = window.fetch;

window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  const url = input.toString();
  
  // Intercept API calls for similar products
  if (url.startsWith('/api/search')) {
    const params = new URL(url, window.location.origin).searchParams;
    const query = params.get('q') || '';
    const limit = Number(params.get('limit')) || 12;
    
    console.log(`Mock API: Searching for ${query}, limit: ${limit}`);
    const mockData = await getMockSimilarProducts(query, limit);
    return createMockResponse(mockData);
  }
  
  // For all other requests, use the original fetch
  return originalFetch(input, init);
};

export const initMockApi = () => {
  console.log('Mock API initialized');
};
