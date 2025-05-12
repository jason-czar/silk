
// Helper function to clean up product titles by removing common prefixes
export const cleanProductTitle = (title: string): string => {
  // List of common prefixes to remove
  const prefixesToRemove = ['Bulk', 'Wholesale', 'Hot Sale', 'New'];
  
  let cleanedTitle = title.trim();
  
  // Check if title starts with any of the prefixes (case insensitive)
  for (const prefix of prefixesToRemove) {
    const regexPattern = new RegExp(`^${prefix}\\s+`, 'i');
    if (regexPattern.test(cleanedTitle)) {
      cleanedTitle = cleanedTitle.replace(regexPattern, '');
    }
  }
  
  return cleanedTitle;
};

// Helper function to extract brand name from title
export const extractBrandName = (title: string): string => {
  const commonBrands = ['Gucci', 'Nike', 'Adidas', 'Amazon', 'Apple', 'Samsung', 'Sony'];
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  // Return first word if no known brand is found
  return title.split(' ')[0];
};

// Extract DHgate itemcode from URL - ENHANCED to support more URL patterns
export const extractItemcode = (url: string): string | null => {
  // Support multiple URL patterns
  
  // Pattern 1: Standard product URL
  // Example: https://www.dhgate.com/product/2023-tailwind-5-v-men-running-shoes-skepta/886638181.html
  let match = url.match(/\/product\/.*?\/(\d+)\.html/);
  if (match && match[1]) return match[1];
  
  // Pattern 2: Direct itemcode in URL
  // Example: https://www.dhgate.com/product/itemcode/12345678.html
  match = url.match(/\/product\/itemcode\/(\d+)\.html/);
  if (match && match[1]) return match[1];
  
  // Pattern 3: Product URL with query parameters
  // Example: https://www.dhgate.com/product/item.html?itemcode=12345678
  match = url.match(/itemcode=(\d+)/);
  if (match && match[1]) return match[1];
  
  // Pattern 4: Shortened URLs
  // Example: https://www.dhgate.com/p/12345678.html
  match = url.match(/\/p\/(\d+)\.html/);
  if (match && match[1]) return match[1];
  
  return null;
};

// Get source platform from URL
export const getProductSource = (url: string): string => {
  if (url.includes('dhgate')) {
    return 'DHgate';
  } else if (url.includes('made-in-china')) {
    return 'Made in China';
  } else if (url.includes('tiktok.com')) {
    return 'TikTok Shop';
  } else if (url.includes('yiwugo')) {
    return 'Yiwugo';
  } else if (url.includes('aliexpress')) {
    return 'AliExpress';
  }
  return 'Unknown';
};

// Get platform favicon - UPDATED to use a single Supabase URL for all icons
export const getPlatformFavicon = (source: string): string => {
  // Using the provided Supabase URL for all favicons
  return "https://jzupbllxgtobpykyerbi.supabase.co/storage/v1/object/sign/favicon/dhgate%20favicon.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2RiZmVjNDliLWNlNzktNDMwMS1iNzAxLTAzMWNmODFhZjViNCJ9.eyJ1cmwiOiJmYXZpY29uL2RoZ2F0ZSBmYXZpY29uLnBuZyIsImlhdCI6MTc0NzA3OTA2MCwiZXhwIjo0ODY5MTQzMDYwfQ.4GQ3xCAnCQwLXosfxy7nHoMQDGXsdlk-jZIrSKCgRxo";
};

// Get source display name - UPDATED to ensure actual website domains are shown
export const getSourceDisplayName = (source: string): string => {
  switch (source) {
    case 'DHgate':
      return 'DHgate.com';
    case 'Made in China':
      return 'MadeinChina.com';
    case 'TikTok Shop':
      return 'TikTok Shop';
    case 'Yiwugo':
      return 'Yiwugo.com';
    case 'AliExpress':
      return 'AliExpress.com';
    default:
      return source;
  }
};

// Fallback color variants for when API doesn't provide them - ENHANCED
export const generateFallbackVariants = (baseImageUrl: string): {url: string, color: string}[] => {
  // Return only the base image as default
  return [
    { url: baseImageUrl, color: 'Default' },
  ];
};

// Get full size image URL from Google thumbnail URL
export const getFullSizeGoogleImage = (thumbnailUrl: string): string => {
  // Check if this is a Google image URL
  if (!thumbnailUrl) return thumbnailUrl;
  
  try {
    // Handle Google image URLs
    if (thumbnailUrl.includes('googleusercontent.com')) {
      // Extract the actual image URL from the Google thumbnail URL
      const urlMatch = thumbnailUrl.match(/url=([^&]+)/);
      if (urlMatch && urlMatch[1]) {
        // Decode the URL and return it
        return decodeURIComponent(urlMatch[1]);
      }
      
      // For direct Google image URLs, try to modify size parameters
      // Replace any size parameters with w=800&h=800
      if (thumbnailUrl.includes('=w')) {
        return thumbnailUrl.replace(/=w\d+-h\d+/, '=w800-h800');
      }
      
      if (thumbnailUrl.includes('=s')) {
        return thumbnailUrl.replace(/=s\d+/, '=s800');
      }
    }
  } catch (error) {
    console.error('Error transforming Google image URL:', error);
  }
  
  // If we can't transform, return the original URL
  return thumbnailUrl;
};

// Helper function to determine if a URL is likely to be an image
export const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check common image file extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  
  for (const ext of imageExtensions) {
    if (lowerUrl.includes(ext)) {
      return true;
    }
  }
  
  // Check if URL contains image-related paths or parameters
  if (lowerUrl.includes('/img/') || lowerUrl.includes('/image/') || 
      lowerUrl.includes('images') || lowerUrl.includes('thumb')) {
    return true;
  }
  
  return false;
};
