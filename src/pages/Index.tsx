
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { ArrowDownCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import ImageGrid from '@/components/ImageGrid';
import { searchImages, ImageSearchResult, ImageSearchParams } from '@/services/imageSearch';

const Index = () => {
  const [searchResults, setSearchResults] = useState<ImageSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<ImageSearchParams | null>(null);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const params = {
        query,
        start: 1,
        num: 10
      };
      setSearchParams(params);
      const results = await searchImages(params);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to fetch images. Please try again.",
        variant: "destructive"
      });
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!searchParams || !searchResults) return;
    setLoading(true);
    try {
      const nextParams = {
        ...searchParams,
        start: searchResults.items.length + 1
      };
      const moreResults = await searchImages(nextParams);

      // Merge the new results with the existing ones
      setSearchResults(prev => {
        if (!prev) return moreResults;
        return {
          ...moreResults,
          items: [...prev.items, ...moreResults.items]
        };
      });

      // Update search params for the next "load more" action
      setSearchParams(nextParams);
    } catch (error) {
      console.error('Load more error:', error);
      toast({
        title: "Error Loading More Images",
        description: error instanceof Error ? error.message : "Failed to load more images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const hasMoreResults = searchResults && parseInt(searchResults.searchInformation.totalResults) > searchResults.items.length;

  return (
    <div className="flex flex-col min-h-screen">
      {!searchResults ? (
        <div className="flex-grow flex items-center justify-center bg-background">
          <div className="container mx-auto px-4 text-center">
            <header className="mb-12">
              <div className="flex justify-center mb-8">
                <img src="/lovable-uploads/b0ee370c-2965-4f6f-9ae5-8366c3b0946c.png" alt="Silk.surf Logo" className="h-12 md:h-14 object-fill" />
              </div>
              <p className="text-gray-600 mb-16 text-2xl px-[42px]">Find similar products - at factory direct prices.</p>
              <SearchBar onSearch={handleSearch} disabled={loading} />
            </header>
          </div>
        </div>
      ) : (
        <div className="bg-[#EBEBEB] min-h-screen">
          <div className="bg-background py-6">
            <div className="container mx-auto px-4">
              <header className="flex items-center mb-4">
                <div className="mr-8">
                  <Link to="/">
                    <img src="/lovable-uploads/b0ee370c-2965-4f6f-9ae5-8366c3b0946c.png" alt="Silk.surf Logo" className="h-8 object-fill cursor-pointer" />
                  </Link>
                </div>
                <div className="flex-grow">
                  <SearchBar onSearch={handleSearch} disabled={loading} />
                </div>
              </header>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-6">
            <main>
              <ImageGrid results={searchResults} loading={loading && !searchResults} />
              
              {searchResults && !loading && hasMoreResults && (
                <div className="flex justify-center mt-8 mb-12">
                  <button 
                    onClick={loadMore} 
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full hover:opacity-90 transition-colors shadow-md"
                  >
                    <span>Load More</span>
                    <ArrowDownCircle size={20} />
                  </button>
                </div>
              )}
              
              {loading && searchResults && (
                <div className="text-center my-8">
                  <div className="animate-spin inline-block w-6 h-6 border-4 border-white border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-gray-400">Loading more images...</span>
                </div>
              )}
              
              {searchResults?.searchInformation && (
                <div className="text-center text-sm text-gray-400 mt-8">
                  Found {searchResults.searchInformation.formattedTotalResults} results 
                  ({searchResults.searchInformation.formattedSearchTime} seconds)
                </div>
              )}
            </main>
          </div>
        </div>
      )}
      
      <footer className={`${searchResults ? 'bg-[#EBEBEB]' : 'bg-background'} mt-auto py-[5px]`}>
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 Silk.surf • Powered by Google Custom Search</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
