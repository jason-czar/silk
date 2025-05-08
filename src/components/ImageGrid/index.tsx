
import React, { useState, useEffect } from 'react';
import { ImageSearchResult } from '@/services/imageSearch';
import { useAuth } from '@/context/AuthContext';
import GridContainer from './GridContainer';
import LoadingSkeleton from './LoadingSkeleton';
import NoResultsMessage from './NoResultsMessage';
import { useFavorites } from './hooks/useFavorites';

interface ImageGridProps {
  results: ImageSearchResult | null;
  loading?: boolean;
  animate?: boolean;
}

const ImageGrid: React.FC<ImageGridProps> = ({ results, loading = false, animate = false }) => {
  const { user } = useAuth();
  const { favoritedItems, isItemFavorited, addToFavorites } = useFavorites(user);
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

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!results || !results.items || results.items.length === 0) {
    return <NoResultsMessage />;
  }

  // Calculate number of items to animate for staggered animation
  const calculateItemsToAnimate = () => {
    if (!results?.items) return 0;
    if (prevItemCount === 0) return 0;
    return Math.max(0, results.items.length - prevItemCount);
  };

  // Store the calculated value
  const itemsToAnimate = calculateItemsToAnimate();

  return (
    <GridContainer 
      animate={animate}
      items={results.items.slice(0, visibleItems)}
      prevItemCount={prevItemCount}
      itemsToAnimate={itemsToAnimate} 
      user={user}
      isItemFavorited={isItemFavorited}
      addToFavorites={addToFavorites}
    />
  );
};

export default ImageGrid;
