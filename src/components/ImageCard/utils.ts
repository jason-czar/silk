
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

// Helper function to get a high-quality image URL
export const getHighQualityImageUrl = (thumbnailUrl: string): string => {
  // For Google image search thumbnails, we can try to access the original image
  if (thumbnailUrl.includes('googleusercontent.com')) {
    // Remove size restrictions or increase them
    return thumbnailUrl.replace(/=s\d+-c/, '=s800-c');
  }
  
  // For DHgate images, increase the size parameter if present
  if (thumbnailUrl.includes('dhgate.com')) {
    // DHgate often uses patterns like ?f_w=600&f_h=600
    return thumbnailUrl.replace(/\?f_w=\d+&f_h=\d+/, '?f_w=1200&f_h=1200');
  }
  
  // Default: return the original URL if we can't improve it
  return thumbnailUrl;
}

// Fallback color variants for when API doesn't provide them
export const generateFallbackVariants = (baseImageUrl: string): {url: string, color: string}[] => {
  // For demo purposes, we'll create some color variants with slight modifications to the URL
  return [
    { url: getHighQualityImageUrl(baseImageUrl), color: 'Default' },
  ];
};
