
import React from 'react';
import { User } from '@supabase/supabase-js';
import GridItem from './GridItem';

interface GridContainerProps {
  animate: boolean;
  items: any[];
  prevItemCount: number;
  itemsToAnimate: number;
  user: User | null;
  isItemFavorited: (link: string, imageUrl: string) => boolean;
  addToFavorites: (item: any) => Promise<void>;
}

const GridContainer: React.FC<GridContainerProps> = ({
  animate,
  items,
  prevItemCount,
  itemsToAnimate,
  user,
  isItemFavorited,
  addToFavorites
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${animate ? 'fade-in' : ''}`}>
      {items.map((item, index) => (
        <GridItem
          key={`${item.link}-${index}`}
          item={item}
          index={index}
          prevItemCount={prevItemCount}
          itemsToAnimate={itemsToAnimate}
          user={user}
          isItemFavorited={isItemFavorited}
          addToFavorites={addToFavorites}
        />
      ))}
    </div>
  );
};

export default GridContainer;
