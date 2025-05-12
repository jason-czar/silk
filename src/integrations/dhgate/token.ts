
import { TokenResponse } from './types';
import { BASE_URL, DHGATE_CONFIG, MAX_RETRIES, RETRY_DELAY, REQUEST_TIMEOUT } from './config';

// Token storage
let cachedToken: TokenResponse | null = null;
let tokenExpiryTime: number = 0;
let failedAttempts = 0;

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
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
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
