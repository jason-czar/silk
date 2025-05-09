
import React, { useState, useEffect } from 'react';
import { ImageSearchResult } from '@/services/imageSearch';
import { useAuth } from '@/context/AuthContext';
import ImageGridSkeleton from './ImageGridSkeleton';
import ImageGridItem from './ImageGridItem';
import { useFavorites } from '@/hooks/useFavorites';

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

  // Track when new items are added to implement staggered animation
  useEffect(() => {
    if (!results?.items) return;
    
    // If this is the initial load or we're replacing results
    if (prevItemCount === 0 || results.items.length <= prevItemCount) {
      setVisibleItems(results.items.length);
      setPrevItemCount(results.items.length);
      return;
    }
    
    // For newly loaded items (from infinite scroll), apply staggered animation
    const newItemCount = results.items.length;
    const itemsToAnimate = newItemCount - prevItemCount;
    
    // Start with current visible count
    let currentCount = prevItemCount;
    
    // Show each new item with a 100ms delay
    const interval = setInterval(() => {
      if (currentCount < newItemCount) {
        currentCount++;
        setVisibleItems(currentCount);
      } else {
        clearInterval(interval);
      }
    }, 100);
    
    setPrevItemCount(newItemCount);
    
    return () => clearInterval(interval);
  }, [results?.items?.length]);

  // Calculate number of items to animate for staggered animation
  const calculateItemsToAnimate = () => {
    if (!results?.items) return 0;
    if (prevItemCount === 0) return 0;
    return Math.max(0, results.items.length - prevItemCount);
  };

  // Store the calculated value
  const itemsToAnimate = calculateItemsToAnimate();

  if (loading) {
    return <ImageGridSkeleton />;
  }

  if (!results || !results.items || results.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No results found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${animate ? 'fade-in' : ''}`}>
      {results.items.slice(0, visibleItems).map((item, index) => (
        <ImageGridItem
          key={`${item.link}-${index}`}
          item={item}
          index={index}
          shouldAnimate={index >= prevItemCount - itemsToAnimate}
          animationDelay={(index - (prevItemCount - itemsToAnimate)) * 0.1}
          favoritedItems={favoritedItems}
          onFavoriteAdded={addFavorite}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
