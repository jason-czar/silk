
import React from 'react';
import ImageCard from './ImageCard/index';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '@/context/AuthContext';
import { use3DTiltEffect } from '@/hooks/use3DTiltEffect';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImageGridItemProps {
  item: any;
  index: number;
  animationDelay: number;
  shouldAnimate: boolean;
  favoritedItems: Array<{ id: string; link: string; image_url: string }>;
  onFavoriteAdded: (favorite: any) => void;
}

const ImageGridItem: React.FC<ImageGridItemProps> = ({ 
  item, 
  index, 
  animationDelay,
  shouldAnimate,
  favoritedItems,
  onFavoriteAdded
}) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { elementRef, styles } = use3DTiltEffect(24); // Updated from 12 to 24 degrees for a more pronounced effect

  return (
    <div 
      ref={elementRef}
      className={`group relative ${
        shouldAnimate ? 'animate-fadeIn opacity-0' : ''
      } ${!isMobile ? 'hover:z-10 shadow-sm hover:shadow-md transition-shadow' : ''}`}
      style={{
        ...(!isMobile ? styles : {}),
        animationDelay: shouldAnimate ? `${animationDelay}s` : undefined,
        animationFillMode: shouldAnimate ? 'forwards' : undefined
      }}
      data-product-id={item.id || index}
    >
      <ImageCard item={item} />
      {user && (
        <FavoriteButton 
          user={user}
          item={item} 
          favoritedItems={favoritedItems}
          onFavoriteAdded={onFavoriteAdded} 
        />
      )}
    </div>
  );
};

export default ImageGridItem;
