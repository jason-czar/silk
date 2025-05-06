
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
  if (!url) return null;
  
  // Handle different URL patterns for DHgate products
  
  // Pattern 1: /product/<product-name>/<itemcode>.html
  const productPattern = url.match(/\/product\/.*?\/(\d+)\.html/);
  if (productPattern) {
    return productPattern[1];
  }
  
  // Pattern 2: itemcode parameter in query string
  const queryPattern = url.match(/[?&]itemcode=(\d+)/);
  if (queryPattern) {
    return queryPattern[1];
  }
  
  // Pattern 3: URL with just numbers (for testing)
  if (/^\d+$/.test(url)) {
    return url;
  }
  
  // Pattern 4: Extract from similar-product URL
  const similarPattern = url.match(/similar-product\/.*?itemcode=(\d+)/);
  if (similarPattern) {
    return similarPattern[1];
  }
  
  console.log("Failed to extract itemcode from URL:", url);
  return null;
};

// Fallback color variants for when API doesn't provide them
export const generateFallbackVariants = (baseImageUrl: string): {url: string, color: string}[] => {
  // For demo purposes, we'll create some color variants with slight modifications to the URL
  return [
    { url: baseImageUrl, color: 'Default' },
  ];
};
