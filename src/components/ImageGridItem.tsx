
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

  // Determine if this is likely a high-quality image based on dimensions
  const isLikelyHighQuality = item.image && 
    item.image.width >= 600 && 
    item.image.height >= 600;

  return (
    <div 
      ref={elementRef}
      className={`group relative ${
        shouldAnimate ? 'animate-fadeIn opacity-0' : ''
      } ${!isMobile ? 'hover:z-10 shadow-md hover:shadow-xl transition-shadow duration-300' : ''}`}
      style={{
        ...(!isMobile ? styles : {}),
        animationDelay: shouldAnimate ? `${animationDelay}s` : undefined,
        animationFillMode: shouldAnimate ? 'forwards' : undefined
      }}
      data-product-id={item.id || index}
      data-image-quality={isLikelyHighQuality ? 'high' : 'standard'}
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
