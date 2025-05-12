
import { TokenResponse } from './types';
import { BASE_URL, MAX_RETRIES, RETRY_DELAY, REQUEST_TIMEOUT } from './config';

// Token storage
let cachedToken: TokenResponse | null = null;
let tokenExpiryTime: number = 0;
let failedAttempts = 0;
let dhgateCredentials: {
  app_key: string;
  app_secret: string;
  username: string;
  password: string;
} | null = null;

/**
 * Fetch DHgate credentials from our Supabase Edge Function
 */
const getDHgateCredentials = async () => {
  if (dhgateCredentials) {
    return dhgateCredentials;
  }
  
  try {
    const response = await fetch('/api/dhgate-auth');
    if (!response.ok) {
      throw new Error(`Failed to get DHgate credentials: ${response.statusText}`);
    }
    
    dhgateCredentials = await response.json();
    return dhgateCredentials;
  } catch (error) {
    console.error('Error fetching DHgate credentials:', error);
    throw new Error('Failed to fetch DHgate API credentials');
  }
};

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
    
    // Get credentials from Edge Function
    const credentials = await getDHgateCredentials();
    
    // Prepare the token request URL
    const tokenUrl = `${BASE_URL}/dop/oauth2/access_token`;
    const params = new URLSearchParams({
      grant_type: 'password',
      username: credentials.username,
      password: credentials.password,
      client_id: credentials.app_key,
      client_secret: credentials.app_secret,
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
