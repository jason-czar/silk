
import React from 'react';
import { Heart } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import HeartFilled from './icons/HeartFilled';

interface FavoriteButtonProps {
  user: any;
  item: any;
  favoritedItems: Array<{ id: string; link: string; image_url: string }>;
  onFavoriteAdded: (favorite: any) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ user, item, favoritedItems, onFavoriteAdded }) => {
  const { toast } = useToast();

  // Check if an item is already in favorites
  const isItemFavorited = (link: string, imageUrl: string) => {
    return favoritedItems.some(item => 
      (item.link === link) || (item.image_url === imageUrl)
    );
  };

  const addToFavorites = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }

    const imageUrl = item.link || item.image?.thumbnailLink;
    
    // Check if item is already in favorites
    if (isItemFavorited(item.link, imageUrl)) {
      toast({
        title: "Item already in your Favorites",
        description: "This item has already been saved to your favorites",
        duration: 5000
      });
      return;
    }

    try {
      const favorite = {
        user_id: user.id,
        image_url: imageUrl,
        title: item.title,
        link: item.link,
        source: item.displayLink
      };

      const { data, error } = await supabase.from('favorites').insert(favorite).select();

      if (error) throw error;

      toast({
        title: "Added to favorites",
        description: "This item has been saved to your favorites"
      });
      
      // Add the new favorite to our local state through callback
      if (data && data.length > 0) {
        onFavoriteAdded(data[0]);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        addToFavorites();
      }}
      className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white dark:hover:bg-gray-700"
      aria-label="Add to favorites"
    >
      {isItemFavorited(item.link, item.image?.thumbnailLink || '') ? (
        <HeartFilled size={16} className="text-red-500" />
      ) : (
        <Heart size={16} className="text-red-500" />
      )}
    </button>
  );
};

export default FavoriteButton;
