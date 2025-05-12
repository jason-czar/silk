
// DHgate API Configuration
export const DHGATE_CONFIG = {
  APP_KEY: "Em4SkdXfkY0X8vg03v8m",
  APP_SECRET: "ugKIDI4gOXTZIH5lLGI6PVVr87iz8OzX",
  SANDBOX_URL: "https://sandbox.api.dhgate.com",
  PRODUCTION_URL: "https://api.dhgate.com",
  DEFAULT_USERNAME: "gynnx",
  DEFAULT_PASSWORD: "1qaz2wsx"
};

// Use production environment
export const BASE_URL = DHGATE_CONFIG.PRODUCTION_URL;
// For sandbox, uncomment this line:
// export const BASE_URL = DHGATE_CONFIG.SANDBOX_URL;

// API request constants
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000; // 1 second initial delay
export const REQUEST_TIMEOUT = 10000; // 10 seconds
