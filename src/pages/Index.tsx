
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { ArrowDownCircle, AlertCircle } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ImageGrid from '@/components/ImageGrid';
import { searchImages, ImageSearchResult, ImageSearchParams } from '@/services/imageSearch';

const Index = () => {
  const [searchResults, setSearchResults] = useState<ImageSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<ImageSearchParams | null>(null);
  const {
    toast
  } = useToast();

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

  return <div className="flex flex-col min-h-screen bg-[#42484b]">
      {!searchResults ? <div className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <header className="mb-12">
              <div className="flex justify-center mb-8">
                <img src="/lovable-uploads/12561f65-e711-4413-84fb-3bbc32633f5c.png" alt="SearchDH Logo" className="h-12 md:h-14 object-fill" />
              </div>
              <p className="text-lg text-gray-300 mb-16">Search for the products you love - find the DHgate alternative in seconds.</p>
              <SearchBar onSearch={handleSearch} disabled={loading} />
            </header>
          </div>
        </div> : <div className="container mx-auto px-4 py-12 flex-grow">
          <header className="text-center mb-12">
            <SearchBar onSearch={handleSearch} disabled={loading} />
          </header>
          
          <main>
            <ImageGrid results={searchResults} loading={loading && !searchResults} />
            
            {searchResults && !loading && hasMoreResults && <div className="flex justify-center mt-8 mb-12">
                <button onClick={loadMore} className="flex items-center gap-2 px-6 py-3 bg-transparent text-white rounded-full hover:bg-white/10 transition-colors shadow-md border border-white/50">
                  <span>Load More</span>
                  <ArrowDownCircle size={20} />
                </button>
              </div>}
            
            {loading && searchResults && <div className="text-center my-8">
                <div className="animate-spin inline-block w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
                <span className="ml-2 text-gray-300">Loading more images...</span>
              </div>}
            
            {searchResults?.searchInformation && <div className="text-center text-sm text-gray-300 mt-8">
                Found {searchResults.searchInformation.formattedTotalResults} results 
                ({searchResults.searchInformation.formattedSearchTime} seconds)
              </div>}
          </main>
        </div>}
      
      <footer className="py-6 bg-opacity-70 mt-auto bg-[#42484b]">
        <div className="container mx-auto px-4 text-center text-sm text-gray-300">
          <p>© 2025 Image Voyage Finder • Powered by Google Custom Search</p>
        </div>
      </footer>
    </div>;
};

export default Index;
