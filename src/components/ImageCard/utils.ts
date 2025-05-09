
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

// Get platform favicon
export const getPlatformFavicon = (source: string): string => {
  switch (source) {
    case 'DHgate':
      return 'https://www.dhgate.com/favicon.ico';
    case 'Made in China':
      return 'https://www.made-in-china.com/favicon.ico';
    case 'TikTok Shop':
      return 'https://www.tiktok.com/favicon.ico';
    case 'Yiwugo':
      return 'https://www.yiwugo.com/favicon.ico';
    case 'AliExpress':
      return 'https://www.aliexpress.us/favicon.ico';
    default:
      return '';
  }
};

// Fallback color variants for when API doesn't provide them
export const generateFallbackVariants = (baseImageUrl: string): {url: string, color: string}[] => {
  // For demo purposes, we'll create some color variants with slight modifications to the URL
  return [
    { url: baseImageUrl, color: 'Default' },
  ];
};

