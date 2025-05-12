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

// Extract DHgate itemcode from URL
export const extractItemcode = (url: string): string | null => {
  // Example URL: https://www.dhgate.com/product/2023-tailwind-5-v-men-running-shoes-skepta/886638181.html
  const match = url.match(/\/product\/.*?\/(\d+)\.html/);
  return match ? match[1] : null;
};

// Get source platform from URL
export const getProductSource = (url: string): string => {
  if (url.includes('dhgate.com')) {
    return 'DHgate';
  } else if (url.includes('made-in-china.com')) {
    return 'Made in China';
  } else if (url.includes('tiktok.com/shop')) {
    return 'TikTok Shop';
  } else if (url.includes('yiwugo.com')) {
    return 'Yiwugo';
  } else if (url.includes('aliexpress')) {
    return 'AliExpress';
  }
  return 'Unknown';
};

// Get platform favicon - UPDATED to use direct Google Drive URLs
export const getPlatformFavicon = (source: string): string => {
  switch (source) {
    case 'DHgate':
      return 'https://drive.google.com/uc?export=view&id=1HqK-AQHVGYK36S-_Zx9557SoSZCimmKB';
    case 'Made in China':
      return 'https://drive.google.com/uc?export=view&id=1ftVDGldHWILKMJ9-fZDlPD4QTq7zllb8';
    case 'TikTok Shop':
      return 'https://drive.google.com/uc?export=view&id=1iuOAOOra93dH7mSbdOh9xEnIhzYRsEuT';
    case 'Yiwugo':
      return 'https://drive.google.com/uc?export=view&id=1J4HLONOUdGYcax-UnxS-pYN7e_OlDf0X';
    case 'AliExpress':
      return 'https://drive.google.com/uc?export=view&id=1J9r92b1rWsZAZLCulce0FdWDrvqhSJFt';
    default:
      return '';
  }
};

// Get source display name
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

// Fallback color variants for when API doesn't provide them
export const generateFallbackVariants = (baseImageUrl: string): {url: string, color: string}[] => {
  // For demo purposes, we'll create some color variants with slight modifications to the URL
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
