
import React from 'react';
import ImageCard from './ImageCard/index';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '@/context/AuthContext';

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

  return (
    <div 
      className={`group relative ${
        shouldAnimate ? 'animate-fadeIn opacity-0' : ''
      }`}
      style={
        shouldAnimate 
          ? { animationDelay: `${animationDelay}s`, animationFillMode: 'forwards' } 
          : {}
      }
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
