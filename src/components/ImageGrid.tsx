
import React from 'react';
import { ImageSearchResult } from '@/services/imageSearch';
import ImageCard from './ImageCard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Heart } from 'lucide-react';

interface ImageGridProps {
  results: ImageSearchResult | null;
  loading?: boolean;
  animate?: boolean;
}

const ImageGrid: React.FC<ImageGridProps> = ({ results, loading = false, animate = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (loading) {
    // Return loading skeleton for image grid
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded animate-pulse">
            <div className="w-full aspect-square"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results || !results.items || results.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No results found. Try a different search term.</p>
      </div>
    );
  }

  const addToFavorites = async (item: any) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }

    try {
      const favorite = {
        user_id: user.id,
        image_url: item.link || item.image?.thumbnailLink,
        title: item.title,
        link: item.link,
        source: item.displayLink
      };

      const { error } = await supabase.from('favorites').insert(favorite);

      if (error) throw error;

      toast({
        title: "Added to favorites",
        description: "This item has been saved to your favorites"
      });
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
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${animate ? 'fade-in' : ''}`}>
      {results.items.map((item, index) => (
        <div key={`${item.link}-${index}`} className="group relative">
          <ImageCard item={item} />
          {user && (
            <button
              onClick={() => addToFavorites(item)}
              className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white dark:hover:bg-gray-700"
              aria-label="Add to favorites"
            >
              <Heart size={16} className="text-red-500" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
