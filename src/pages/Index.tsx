import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { ArrowDownCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import ImageGrid from '@/components/ImageGrid';
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import { searchImages, ImageSearchResult, ImageSearchParams } from '@/services/imageSearch';
import { useIsMobile } from '@/hooks/use-mobile';
const Index = () => {
  const [searchResults, setSearchResults] = useState<ImageSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<ImageSearchParams | null>(null);
  const [animateResults, setAnimateResults] = useState(false);
  const isMobile = useIsMobile();
  const {
    toast
  } = useToast();

  // Animation effect for search results
  useEffect(() => {
    if (searchResults && !loading) {
      setAnimateResults(true);
    }
  }, [searchResults, loading]);
  const handleSearch = async (query: string, useDHgate: boolean = false) => {
    setLoading(true);
    setAnimateResults(false);
    try {
      const params = {
        query,
        start: 1,
        num: 10,
        useDHgate
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
        start: searchResults.items?.length ? searchResults.items.length + 1 : 1
      };
      const moreResults = await searchImages(nextParams);

      // Merge the new results with the existing ones
      setSearchResults(prev => {
        if (!prev) return moreResults;
        return {
          ...moreResults,
          items: [...(prev.items || []), ...(moreResults.items || [])]
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
  const resetSearch = () => {
    setSearchResults(null);
    setSearchParams(null);
    setAnimateResults(false);
  };
  const hasMoreResults = searchResults && searchResults.searchInformation && searchResults.items && parseInt(searchResults.searchInformation.totalResults) > searchResults.items.length;
  return <div className="flex flex-col min-h-screen">
      {!searchResults ? <div className="flex-grow flex items-center justify-center bg-background transition-colors duration-300">
          <div className="container mx-auto px-4 text-center">
            <header className="mb-12 -mt-[25px]">
              <div className="flex items-center justify-center mb-8">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <UserMenu />
                  <ThemeToggle />
                </div>
                <img src="/lovable-uploads/db230db2-4a02-4e6f-b7b7-f54da79455b2.png" alt="Silk Logo" className="h-12 md:h-14" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-16 text-xl sm:text-2xl px-4 sm:px-[42px] transition-colors duration-300">Find similar products - at factory direct prices.</p>
              <div className="scale-in">
                <SearchBar onSearch={handleSearch} disabled={loading} />
              </div>
            </header>
          </div>
        </div> : <div className="bg-[#EBEBEB] dark:bg-gray-900 min-h-screen transition-colors duration-300">
          <div className="bg-background dark:bg-gray-800 py-[14px] transition-colors duration-300">
            <div className="container mx-auto px-4">
              <header className="flex items-center mb-4">
                <div className={`${isMobile ? 'mr-2' : 'mr-8'}`}>
                  <div onClick={resetSearch} className="cursor-pointer">
                    {/* SVG version of the hashtag logo */}
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24.8889 4L19.5556 28M12.4444 4L7.11111 28M28 10.6667H4M28 21.3333H4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <SearchBar onSearch={handleSearch} disabled={loading} />
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <UserMenu />
                  <ThemeToggle />
                </div>
              </header>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-6">
            <main className={animateResults ? 'fade-in' : ''}>
              <ImageGrid results={searchResults} loading={loading && !searchResults} animate={animateResults} />
              
              {searchResults && !loading && hasMoreResults && <div className="flex justify-center mt-8 mb-12">
                  <button onClick={loadMore} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-black dark:text-white rounded-full hover:opacity-90 transition-colors shadow-md">
                    <span>Load More</span>
                    <ArrowDownCircle size={20} />
                  </button>
                </div>}
              
              {loading && searchResults && <div className="text-center my-8">
                  <div className="animate-spin inline-block w-6 h-6 border-4 border-white dark:border-gray-600 border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-gray-400 dark:text-gray-500">Loading more images...</span>
                </div>}
              
              {searchResults?.searchInformation}
            </main>
          </div>
        </div>}
      
      <footer className={`${searchResults ? 'bg-[#EBEBEB] dark:bg-gray-900' : 'bg-background dark:bg-gray-800'} mt-auto py-[5px] transition-colors duration-300`}>
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Silk.surf</p>
        </div>
      </footer>
    </div>;
};
export default Index;