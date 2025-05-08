
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface FavoriteItem {
  id: string;
  link: string;
  image_url: string;
}

export const useFavorites = (user: User | null) => {
  const { toast } = useToast();
  const [favoritedItems, setFavoritedItems] = useState<FavoriteItem[]>([]);

  // Fetch user's favorited items when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchUserFavorites();
    } else {
      setFavoritedItems([]);
    }
  }, [user]);

  // Function to fetch user's favorited items from Supabase
  const fetchUserFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id, link, image_url')
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }
      
      setFavoritedItems(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Check if an item is already in favorites
  const isItemFavorited = (link: string, imageUrl: string) => {
    return favoritedItems.some(item => 
      (item.link === link) || (item.image_url === imageUrl)
    );
  };

  const addToFavorites = async (item: any) => {
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
      
      // Add the new favorite to our local state
      if (data && data.length > 0) {
        setFavoritedItems([...favoritedItems, data[0]]);
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

  return { favoritedItems, isItemFavorited, addToFavorites, fetchUserFavorites };
};
