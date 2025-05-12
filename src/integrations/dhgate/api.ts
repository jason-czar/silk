
import { BASE_URL, REQUEST_TIMEOUT } from './config';
import { getDHgateToken } from './token';

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
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
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
