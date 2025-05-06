
import { toast } from "@/components/ui/use-toast";

// DHgate API Configuration
const DHGATE_CONFIG = {
  APP_KEY: "Em4SkdXfkY0X8vg03v8m",
  APP_SECRET: "ugKIDI4gOXTZIH5lLGI6PVVr87iz8OzX",
  SANDBOX_URL: "http://sandbox.api.dhgate.com",
  PRODUCTION_URL: "http://api.dhgate.com",
  DEFAULT_USERNAME: "gynnx",
  DEFAULT_PASSWORD: "1qaz2wsx"
};

// Use production environment
const BASE_URL = DHGATE_CONFIG.PRODUCTION_URL;

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 60, // Adjust based on DHgate's actual limits
  REQUESTS: [] as number[],
  isRateLimited: function(): boolean {
    const now = Date.now();
    // Remove timestamps older than 1 minute
    this.REQUESTS = this.REQUESTS.filter(timestamp => now - timestamp < 60000);
    return this.REQUESTS.length >= this.MAX_REQUESTS_PER_MINUTE;
  },
  addRequest: function(): void {
    this.REQUESTS.push(Date.now());
  }
};

// Token storage
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

// Define interface for product response
export interface DHgateProductResponse {
  product: {
    itemCode: string;
    itemName: string;
    originalImageUrl?: string;
    skuProperties?: Array<{
      propertyId: string;
      propertyName?: string;
      values: Array<{
        propertyValueId?: string;
        propertyValueDisplayName?: string;
        imageUrl?: string;
      }>;
    }>;
    imageList?: Array<{
      imageUrl: string;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
}

// Define interface for product search response
export interface DHgateSearchResponse {
  totalItem: number;
  totalPage: number;
  pageSize: number;
  pageNum: number;
  items: any[];
  [key: string]: any;
}

// Define interface for seller response
export interface DHgateSellerResponse {
  seller: any;
  [key: string]: any;
}

let cachedToken: TokenResponse | null = null;
let tokenExpiryTime: number = 0;
let refreshTokenPromise: Promise<string> | null = null;

/**
 * Get an access token from DHgate with retry logic
 */
export const getDHgateToken = async (retryCount: number = 0): Promise<string> => {
  const currentTime = Date.now();
  
  // Return cached token if valid
  if (cachedToken && tokenExpiryTime > currentTime) {
    return cachedToken.access_token;
  }

  // If a token refresh is already in progress, wait for that to complete
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  // Handle rate limiting
  if (RATE_LIMIT.isRateLimited()) {
    console.warn("DHgate API rate limit reached, waiting...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return getDHgateToken(retryCount);
  }

  try {
    // Create a promise for the token refresh
    refreshTokenPromise = (async () => {
      // Prepare the token request URL
      const tokenUrl = `${BASE_URL}/dop/oauth2/access_token`;
      const params = new URLSearchParams({
        grant_type: 'password',
        username: DHGATE_CONFIG.DEFAULT_USERNAME,
        password: DHGATE_CONFIG.DEFAULT_PASSWORD,
        client_id: DHGATE_CONFIG.APP_KEY,
        client_secret: DHGATE_CONFIG.APP_SECRET,
        scope: 'basic'
      });
      
      RATE_LIMIT.addRequest();
      const response = await fetch(`${tokenUrl}?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get DHgate token: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const tokenData: TokenResponse = await response.json();
      
      // Cache the token and set expiry time (subtract 5 minutes for safety)
      cachedToken = tokenData;
      // Note: DHgate returns expiry as a timestamp, not seconds from now
      tokenExpiryTime = typeof tokenData.expires_in === 'number' 
        ? (tokenData.expires_in > 9999999999 ? tokenData.expires_in : Date.now() + (tokenData.expires_in * 1000))
        : Date.now() + 3600000; // Default to 1 hour if invalid format
      
      // Subtract 5 minutes for safety
      tokenExpiryTime -= 300000;
      
      return tokenData.access_token;
    })();
    
    return await refreshTokenPromise;
  } catch (error) {
    console.error('Error getting DHgate token:', error);
    
    // Retry logic
    if (retryCount < 3) {
      console.log(`Retrying token request (${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return getDHgateToken(retryCount + 1);
    }
    
    throw new Error('Failed to authenticate with DHgate API after multiple attempts');
  } finally {
    // Clear the promise so future requests can try again
    refreshTokenPromise = null;
  }
};

/**
 * Make a request to the DHgate API with retry and rate limiting
 */
export const dhgateApiRequest = async <T>(
  method: string,
  version: string = '1.0',
  params: Record<string, string> = {},
  retryCount: number = 0
): Promise<T> => {
  try {
    // Handle rate limiting
    if (RATE_LIMIT.isRateLimited()) {
      console.warn("DHgate API rate limit reached, waiting...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return dhgateApiRequest(method, version, params, retryCount);
    }
    
    // Get access token
    const accessToken = await getDHgateToken();
    
    // Prepare the API request URL and parameters
    const apiUrl = `${BASE_URL}/dop/router`;
    const requestParams = new URLSearchParams({
      method,
      v: version,
      access_token: accessToken,
      ...params
    });
    
    RATE_LIMIT.addRequest();
    const response = await fetch(`${apiUrl}?${requestParams.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DHgate API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Check for API errors in the response
    if (data.error_response) {
      // Special handling for token expiration
      if (data.error_response.code === "401" || data.error_response.code === "40001") {
        // Clear the cached token to force a refresh
        cachedToken = null;
        tokenExpiryTime = 0;
        
        if (retryCount < 2) {
          console.log("Token expired, refreshing and retrying...");
          return dhgateApiRequest(method, version, params, retryCount + 1);
        }
      }
      
      throw new Error(data.error_response.msg || 'DHgate API error');
    }
    
    return data as T;
  } catch (error) {
    console.error(`Error in DHgate API request (${method}):`, error);
    
    // Retry logic for recoverable errors
    if (retryCount < 3 && !(error instanceof Error && error.message.includes('rate limit'))) {
      console.log(`Retrying API request (${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return dhgateApiRequest(method, version, params, retryCount + 1);
    }
    
    throw error;
  }
};

/**
 * Get product details by itemcode
 */
export const getProductByItemcode = async (itemcode: string): Promise<DHgateProductResponse['product']> => {
  try {
    console.log("Fetching product details for itemcode:", itemcode);
    const response = await dhgateApiRequest<DHgateProductResponse>('dh.product.get', '1.0', { itemcode });
    
    console.log("DHgate product response:", JSON.stringify(response, null, 2));
    
    // Check if we have image information and log it for debugging
    if (response.product) {
      if (response.product.skuProperties) {
        console.log("Found SKU properties with images:", 
          response.product.skuProperties
            .filter(prop => prop.values.some(v => v.imageUrl))
            .length
        );
      }
      
      if (response.product.imageList) {
        console.log("Found image list with", response.product.imageList.length, "images");
      }
    }
    
    return response.product;
  } catch (error) {
    console.error('Error fetching product details:', error);
    
    // Show a toast notification to the user
    toast({
      title: "Error Fetching Product",
      description: error instanceof Error ? error.message : "Failed to fetch product details",
      variant: "destructive"
    });
    
    throw error;
  }
};

/**
 * Search products by keyword with pagination and error handling
 */
export const searchDHgateProducts = async (
  keyword: string, 
  pageNum: number = 1, 
  pageSize: number = 20
): Promise<DHgateSearchResponse> => {
  try {
    const response = await dhgateApiRequest<DHgateSearchResponse>('dh.product.search', '1.0', {
      keyword,
      pageNum: pageNum.toString(),
      pageSize: pageSize.toString()
    });
    
    // Verify response data integrity
    if (!response.items || !Array.isArray(response.items)) {
      console.warn('DHgate search returned invalid items array:', response);
      // Return a valid but empty response
      return {
        totalItem: 0,
        totalPage: 0,
        pageSize,
        pageNum,
        items: []
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error searching DHgate products:', error);
    
    // Show a toast notification to the user
    toast({
      title: "Search Error",
      description: error instanceof Error ? error.message : "Failed to search DHgate products",
      variant: "destructive"
    });
    
    // Return a valid but empty response
    return {
      totalItem: 0,
      totalPage: 0,
      pageSize,
      pageNum,
      items: []
    };
  }
};

/**
 * Get seller information with error handling
 */
export const getSellerInfo = async () => {
  try {
    const response = await dhgateApiRequest<DHgateSellerResponse>('dh.user.seller.get', '1.0');
    return response.seller;
  } catch (error) {
    console.error('Error fetching seller info:', error);
    
    // Show a toast notification to the user
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to fetch seller information",
      variant: "destructive"
    });
    
    return null;
  }
};

/**
 * Get similar products by itemcode with error handling
 */
export const getSimilarProductsByItemcode = async (
  itemcode: string,
  pageNum: number = 1,
  pageSize: number = 20
): Promise<DHgateSearchResponse> => {
  try {
    // DHgate doesn't have a direct API for similar products, so we use search with the product's category
    // First, get the product details to find its category
    const product = await getProductByItemcode(itemcode);
    
    if (!product || !product.categoryId) {
      throw new Error('Product details or category not available');
    }
    
    // Search for products in the same category
    const response = await dhgateApiRequest<DHgateSearchResponse>('dh.product.search', '1.0', {
      categoryId: product.categoryId,
      pageNum: pageNum.toString(),
      pageSize: pageSize.toString()
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching similar products:', error);
    
    // Show a toast notification to the user
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to fetch similar products",
      variant: "destructive"
    });
    
    // Return a valid but empty response
    return {
      totalItem: 0,
      totalPage: 0,
      pageSize,
      pageNum,
      items: []
    };
  }
};
