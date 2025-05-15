
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to convert Google Drive sharing URLs to direct download URLs
export function getGoogleDriveDirectUrl(fileId: string): string {
  return `https://drive.usercontent.google.com/download?id=${fileId}&export=view&authuser=0`;
}

// Enhanced function to get the best quality image from a URL
export function getBestQualityImageUrl(url: string): string {
  if (!url) return url;
  
  try {
    // Handle Google image URLs to get best possible version
    if (url.includes('googleusercontent.com')) {
      // Extract the actual image URL from the Google thumbnail URL
      const urlMatch = url.match(/url=([^&]+)/);
      if (urlMatch && urlMatch[1]) {
        return decodeURIComponent(urlMatch[1]);
      }
      
      // For direct Google image URLs, try to modify size parameters for better quality
      if (url.includes('=w')) {
        return url.replace(/=w\d+-h\d+/, '=w800-h800');
      }
      
      if (url.includes('=s')) {
        return url.replace(/=s\d+/, '=s800');
      }
    }
    
    // Handle common image CDNs to request higher quality
    if (url.includes('cloudinary.com')) {
      // Replace transformation parameters for higher quality
      return url.replace(/\/upload\/.*?\//, '/upload/q_auto,f_auto,w_800,h_800,c_limit/');
    }
    
    if (url.includes('amazonaws.com') && url.includes('resize=')) {
      // Update AWS image resizer parameters
      return url.replace(/resize=\d+x\d+/, 'resize=800x800');
    }
    
    // Add m parameter to most image URLs to avoid caching issues
    if (url.includes('?')) {
      return `${url}&m=${new Date().getTime()}`;
    } else {
      return `${url}?m=${new Date().getTime()}`;
    }
  } catch (error) {
    console.error('Error processing image URL for best quality:', error);
  }
  
  // Return original URL as fallback
  return url;
}

// Check if an image meets quality thresholds
export function isHighQualityImage(width: number, height: number): boolean {
  const MIN_DIMENSION = 400;
  const MIN_RESOLUTION = 400 * 400;
  
  return (width >= MIN_DIMENSION && 
          height >= MIN_DIMENSION &&
          width * height >= MIN_RESOLUTION);
}
