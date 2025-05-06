
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

// Use sandbox environment for development
const BASE_URL = DHGATE_CONFIG.SANDBOX_URL;
// For production, uncomment this line:
// const BASE_URL = DHGATE_CONFIG.PRODUCTION_URL;

// Token storage
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

// Define interface for product response
interface DHgateProductResponse {
  product: any;
  [key: string]: any;
}

// Define interface for product search response
interface DHgateSearchResponse {
  totalItem: number;
  totalPage: number;
  pageSize: number;
  pageNum: number;
  items: any[];
  [key: string]: any;
}

// Define interface for seller response
interface DHgateSellerResponse {
  seller: any;
  [key: string]: any;
}

let cachedToken: TokenResponse | null = null;
let tokenExpiryTime: number = 0;

/**
 * Get an access token from DHgate
 */
export const getDHgateToken = async (): Promise<string> => {
  const currentTime = Date.now();
  
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiryTime > currentTime) {
    return cachedToken.access_token;
  }
  
  try {
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
    
    const response = await fetch(`${tokenUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get DHgate token: ${response.statusText}`);
    }
    
    const tokenData: TokenResponse = await response.json();
    
    // Cache the token and set expiry time (subtract 5 minutes for safety)
    cachedToken = tokenData;
    // Note: DHgate returns expiry as a timestamp, not seconds from now
    tokenExpiryTime = typeof tokenData.expires_in === 'number' 
      ? tokenData.expires_in // If it's already a timestamp
      : Date.now() + (tokenData.expires_in * 1000) - 300000; // Convert seconds to ms and subtract 5 minutes
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting DHgate token:', error);
    throw new Error('Failed to authenticate with DHgate API');
  }
};

/**
 * Make a request to the DHgate API
 */
export const dhgateApiRequest = async <T>(
  method: string,
  version: string = '1.0',
  params: Record<string, string> = {}
): Promise<T> => {
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
    
    const response = await fetch(`${apiUrl}?${requestParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`DHgate API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check for API errors in the response
    if (data.error_response) {
      throw new Error(data.error_response.msg || 'DHgate API error');
    }
    
    return data as T;
  } catch (error) {
    console.error(`Error in DHgate API request (${method}):`, error);
    throw error;
  }
};

/**
 * Get product details by itemcode
 */
export const getProductByItemcode = async (itemcode: string) => {
  try {
    const response = await dhgateApiRequest<DHgateProductResponse>('dh.product.get', '1.0', { itemcode });
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
