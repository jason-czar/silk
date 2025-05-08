
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Heart } from 'lucide-react';
import ImageCard from '../ImageCard';
import HeartFilled from '../icons/HeartFilled';

interface GridItemProps {
  item: any;
  index: number;
  prevItemCount: number;
  itemsToAnimate: number;
  user: User | null;
  isItemFavorited: (link: string, imageUrl: string) => boolean;
  addToFavorites: (item: any) => Promise<void>;
}

const GridItem: React.FC<GridItemProps> = ({
  item,
  index,
  prevItemCount,
  itemsToAnimate,
  user,
  isItemFavorited,
  addToFavorites
}) => {
  const shouldAnimate = index >= prevItemCount - itemsToAnimate;
  const animationDelay = shouldAnimate ? `${(index - (prevItemCount - itemsToAnimate)) * 0.1}s` : undefined;
  
  return (
    <div 
      className={`group relative ${shouldAnimate ? 'animate-fadeIn opacity-0' : ''}`}
      style={shouldAnimate ? { animationDelay, animationFillMode: 'forwards' } : {}}
    >
      <ImageCard item={item} />
      {user && (
        <button
          onClick={() => addToFavorites(item)}
          className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white dark:hover:bg-gray-700"
          aria-label="Add to favorites"
        >
          {isItemFavorited(item.link, item.image?.thumbnailLink || '') ? (
            <HeartFilled size={16} className="text-red-500" />
          ) : (
            <Heart size={16} className="text-red-500" />
          )}
        </button>
      )}
    </div>
  );
};

export default GridItem;
