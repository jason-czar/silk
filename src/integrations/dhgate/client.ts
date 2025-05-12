
import { toast } from "@/components/ui/use-toast";

// DHgate API Configuration
const DHGATE_CONFIG = {
  APP_KEY: "Em4SkdXfkY0X8vg03v8m",
  APP_SECRET: "ugKIDI4gOXTZIH5lLGI6PVVr87iz8OzX",
  SANDBOX_URL: "https://sandbox.api.dhgate.com",
  PRODUCTION_URL: "https://api.dhgate.com",
  DEFAULT_USERNAME: "gynnx",
  DEFAULT_PASSWORD: "1qaz2wsx"
};

// Use production environment
const BASE_URL = DHGATE_CONFIG.PRODUCTION_URL;
// For sandbox, uncomment this line:
// const BASE_URL = DHGATE_CONFIG.SANDBOX_URL;

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
let failedAttempts = 0;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second initial delay

/**
 * Get an access token from DHgate with retry mechanism
 */
export const getDHgateToken = async (): Promise<string> => {
  const currentTime = Date.now();
  
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiryTime > currentTime) {
    return cachedToken.access_token;
  }
  
  try {
    // Reset failed attempts if this is a fresh token request
    if (!cachedToken) {
      failedAttempts = 0;
    }
    
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
    
    // Use fetch with timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${tokenUrl}?${params.toString()}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to get DHgate token: ${response.statusText} (${response.status})`);
    }
    
    const tokenData: TokenResponse = await response.json();
    
    // Cache the token and set expiry time (subtract 5 minutes for safety)
    cachedToken = tokenData;
    // Note: DHgate returns expiry as a timestamp, not seconds from now
    tokenExpiryTime = typeof tokenData.expires_in === 'number' 
      ? tokenData.expires_in // If it's already a timestamp
      : Date.now() + (tokenData.expires_in * 1000) - 300000; // Convert seconds to ms and subtract 5 minutes
    
    // Reset failed attempts on success
    failedAttempts = 0;
    
    return tokenData.access_token;
  } catch (error) {
    failedAttempts++;
    console.error(`Error getting DHgate token (attempt ${failedAttempts}):`, error);
    
    // Try again with exponential backoff if we haven't exceeded MAX_RETRIES
    if (failedAttempts <= MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, failedAttempts - 1);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return getDHgateToken(); // Recursive retry
    }
    
    // If all retries fail, throw the error
    throw new Error('Failed to authenticate with DHgate API');
  }
};

/**
 * Make a request to the DHgate API with retry mechanism
 */
export const dhgateApiRequest = async <T>(
  method: string,
  version: string = '1.0',
  params: Record<string, string> = {}
): Promise<T> => {
  let retries = 0;
  const maxRetries = 2;
  
  while (retries <= maxRetries) {
    try {
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
      
      // Set a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${apiUrl}?${requestParams.toString()}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`DHgate API error: ${response.statusText} (${response.status})`);
      }
      
      const data = await response.json();
      
      // Check for API errors in the response
      if (data.error_response) {
        throw new Error(data.error_response.msg || 'DHgate API error');
      }
      
      return data as T;
    } catch (error) {
      retries++;
      console.error(`Error in DHgate API request (${method}) - attempt ${retries}:`, error);
      
      if (retries <= maxRetries) {
        // Exponential backoff
        const delay = 1000 * Math.pow(2, retries - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`Max retries reached for ${method}. Giving up.`);
        throw error;
      }
    }
  }
  
  // This should never happen but TypeScript requires it
  throw new Error(`Failed to complete DHgate API request (${method}) after ${maxRetries} retries`);
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
    throw error;
  }
};

/**
 * Search products by keyword
 */
export const searchDHgateProducts = async (keyword: string, pageNum: number = 1, pageSize: number = 20) => {
  try {
    const response = await dhgateApiRequest<DHgateSearchResponse>('dh.product.search', '1.0', {
      keyword,
      pageNum: pageNum.toString(),
      pageSize: pageSize.toString()
    });
    return response;
  } catch (error) {
    console.error('Error searching DHgate products:', error);
    throw error;
  }
};

/**
 * Get seller information
 */
export const getSellerInfo = async () => {
  try {
    const response = await dhgateApiRequest<DHgateSellerResponse>('dh.user.seller.get', '1.0');
    return response.seller;
  } catch (error) {
    console.error('Error fetching seller info:', error);
    throw error;
  }
};
