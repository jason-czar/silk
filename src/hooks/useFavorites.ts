
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FavoriteItem {
  id: string;
  link: string;
  image_url: string;
}

export function useFavorites(userId: string | undefined) {
  const [favoritedItems, setFavoritedItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's favorited items when component mounts or user changes
  useEffect(() => {
    if (userId) {
      fetchUserFavorites();
    } else {
      setFavoritedItems([]);
    }
  }, [userId]);

  // Function to fetch user's favorited items from Supabase
  const fetchUserFavorites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id, link, image_url')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
      
      setFavoritedItems(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a favorite item to the local state
  const addFavorite = (newFavorite: FavoriteItem) => {
    setFavoritedItems([...favoritedItems, newFavorite]);
  };

  return {
    favoritedItems,
    addFavorite,
    isLoadingFavorites: isLoading
  };
}
