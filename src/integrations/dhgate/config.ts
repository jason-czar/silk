
// DHgate API Configuration - reading from Supabase Edge Functions secrets
export const DHGATE_CONFIG = {
  // Default values are only used during development before secrets are configured
  APP_KEY: "",
  APP_SECRET: "",
  SANDBOX_URL: "https://sandbox.api.dhgate.com",
  PRODUCTION_URL: "http://api.dhgate.com", // Updated to match the documentation
  DEFAULT_USERNAME: "",
  DEFAULT_PASSWORD: ""
};

// Use production environment
export const BASE_URL = DHGATE_CONFIG.PRODUCTION_URL;
// For sandbox, uncomment this line:
// export const BASE_URL = DHGATE_CONFIG.SANDBOX_URL;

// API request constants
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000; // 1 second initial delay
export const REQUEST_TIMEOUT = 10000; // 10 seconds
