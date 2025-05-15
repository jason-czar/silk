
import React, { useState, useEffect } from 'react';
import { ImageSearchResult } from '@/services/imageSearch';
import { useAuth } from '@/context/AuthContext';
import ImageGridSkeleton from './ImageGridSkeleton';
import ImageGridItem from './ImageGridItem';
import { useFavorites } from '@/hooks/useFavorites';
import { trackError, trackEvent } from '@/services/analytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ImageGridProps {
  results: ImageSearchResult | null;
  loading?: boolean;
  animate?: boolean;
}

const ImageGrid: React.FC<ImageGridProps> = ({ results, loading = false, animate = false }) => {
  const { user } = useAuth();
  const { favoritedItems, addFavorite } = useFavorites(user?.id);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [prevItemCount, setPrevItemCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Determine batch size based on device type - load fewer items on mobile
  const batchSize = isMobile ? 4 : 8;

  // Track when new items are added to implement staggered animation
  useEffect(() => {
    if (!results?.items) return;
    
    try {
      // If this is the initial load or we're replacing results
      if (prevItemCount === 0 || results.items.length <= prevItemCount) {
        // For initial load, stagger the appearance of items
        if (animate) {
          let count = 0;
          const interval = setInterval(() => {
            count += batchSize;
            setVisibleItems(Math.min(count, results.items.length));
            if (count >= results.items.length) {
              clearInterval(interval);
            }
          }, isMobile ? 100 : 60); // Slightly slower on mobile for better performance
          
          return () => clearInterval(interval);
        } else {
          // No animation, show all at once
          setVisibleItems(results.items.length);
        }
        
        setPrevItemCount(results.items.length);
        return;
      }
      
      // For newly loaded items (from infinite scroll)
      const newItemCount = results.items.length;
      const itemsToAnimate = newItemCount - prevItemCount;
      
      // Start with current visible count
      let currentCount = prevItemCount;
      
      // Show each new batch with a slight delay
      const interval = setInterval(() => {
        if (currentCount < newItemCount) {
          currentCount = Math.min(currentCount + batchSize, newItemCount);
          setVisibleItems(currentCount);
        } else {
          clearInterval(interval);
        }
      }, 100);
      
      setPrevItemCount(newItemCount);
      
      return () => clearInterval(interval);
    } catch (err) {
      console.error("Error animating grid items:", err);
      setError("Unable to display grid items properly. Please refresh.");
      trackError("ImageGrid animation error", "GRID_ANIMATION", { 
        message: err instanceof Error ? err.message : String(err) 
      });
      
      // Fallback to showing all items without animation
      if (results?.items) {
        setVisibleItems(results.items.length);
      }
    }
  }, [results?.items?.length, animate, isMobile, batchSize]);

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <ImageGridSkeleton count={isMobile ? 4 : 8} />;
  }

  if (!results || !results.items || results.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No results found. Try a different search term.</p>
      </div>
    );
  }

  // Track successful grid rendering for analytics
  useEffect(() => {
    if (results?.items?.length) {
      trackEvent('click', { 
        element: 'image_grid',
        itemCount: results.items.length,
        visibleItems
      });
    }
  }, [visibleItems, results?.items?.length]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {results.items.slice(0, visibleItems).map((item, index) => (
        <ImageGridItem
          key={`${item.link}-${index}`}
          item={item}
          index={index}
          shouldAnimate={true}
          animationDelay={(index * 0.05)} // Faster animation to improve perceived performance
          favoritedItems={favoritedItems}
          onFavoriteAdded={addFavorite}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
