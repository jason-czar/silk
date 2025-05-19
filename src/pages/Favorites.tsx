import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import { Trash2 } from 'lucide-react';
interface Favorite {
  id: string;
  image_url: string;
  title: string | null;
  link: string | null;
  source: string | null;
  created_at: string;
}
export default function Favorites() {
  const {
    user,
    loading
  } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    toast
  } = useToast();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  useEffect(() => {
    // Check if user is not logged in after auth loading completes
    if (!loading && !user) {
      setShouldRedirect(true);
      return;
    }

    // Only fetch favorites if the user is logged in
    if (user) {
      fetchFavorites();
    }
  }, [user, loading]);
  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const {
        data,
        error
      } = await supabase.from('favorites').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const removeFavorite = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from('favorites').delete().eq('id', id);
      if (error) throw error;
      setFavorites(favorites.filter(fav => fav.id !== id));
      toast({
        title: "Success",
        description: "Item removed from favorites"
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Render redirect component if needed
  if (shouldRedirect) {
    return <Navigate to="/auth" />;
  }
  return <div className="min-h-screen bg-[#EBEBEB] dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-background dark:bg-gray-800 py-[14px] transition-colors duration-300">
        <div className="container mx-auto px-4">
          <header className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center">
              <img src="/lovable-uploads/db230db2-4a02-4e6f-b7b7-f54da79455b2.png" alt="Silk Logo" className="h-8" />
            </Link>
            <div className="flex items-center gap-4">
              <UserMenu />
              <ThemeToggle />
            </div>
          </header>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>
        
        {isLoading ? <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div> : favorites.length === 0 ? <Card className="bg-white dark:bg-gray-800">
            <CardContent className="py-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">You don't have any favorites yet.</p>
              <Link to="/" className="mt-4 inline-block text-primary hover:underline">
                Discover products
              </Link>
            </CardContent>
          </Card> : <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map(favorite => <Card key={favorite.id} className="overflow-hidden group relative">
                <a href={favorite.link || '#'} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img src={favorite.image_url} alt={favorite.title || 'Favorited item'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                </a>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">
                    {favorite.title || 'Untitled'}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {favorite.source || 'Unknown source'}
                    </span>
                    <button onClick={() => removeFavorite(favorite.id)} className="text-red-500 hover:text-red-700 transition-colors p-1" aria-label="Remove from favorites">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>)}
          </div>}
      </div>
    </div>;
}