
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [autoLoading, setAutoLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
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
    if (!searchParams || !searchResults || loading || autoLoading) return;
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

  const autoLoadMore = useCallback(async () => {
    if (!searchParams || !searchResults || loading || autoLoading) return;
    setAutoLoading(true);
    
    // Add a slight delay to show the loading animation
    try {
      const nextParams = {
        ...searchParams,
        start: searchResults.items?.length ? searchResults.items.length + 1 : 1
      };

      // Add a 1 second delay for the loading animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      console.error('Auto load more error:', error);
      toast({
        title: "Error Loading More Images",
        description: error instanceof Error ? error.message : "Failed to load more images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAutoLoading(false);
    }
  }, [searchParams, searchResults, loading, autoLoading, toast]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!searchResults) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreResults && !loading && !autoLoading) {
          autoLoadMore();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    const currentObserver = observerRef.current;
    const currentRef = loadMoreRef.current;
    
    if (currentRef) {
      currentObserver.observe(currentRef);
    }

    return () => {
      if (currentRef && currentObserver) {
        currentObserver.unobserve(currentRef);
      }
    };
  }, [searchResults, hasMoreResults, loading, autoLoading, autoLoadMore]);

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
                <h1 className="font-['Montserrat'] font-black italic text-[#3ECF8E] text-7xl">Silk</h1>
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
              <header className="flex items-center mb-4 pl-[10px]">
                <div className={`${isMobile ? 'mr-2' : 'mr-8'}`}>
                  <div onClick={resetSearch} className="cursor-pointer">
                    <h2 className="font-['Montserrat'] font-black italic text-[#3ECF8E] text-2xl">Silk</h2>
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
              
              {/* Infinite Scroll Loading Indicator - This replaces the Load More button */}
              {searchResults && !loading && hasMoreResults && (
                <div ref={loadMoreRef} className="h-16 flex items-center justify-center my-4">
                  {autoLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin mb-2 w-6 h-6 border-4 border-[#3ECF8E] border-t-transparent rounded-full"></div>
                      <span className="text-gray-500">Loading more items...</span>
                    </div>
                  ) : (
                    <div className="h-8 opacity-0">Loading trigger</div>
                  )}
                </div>
              )}
              
              {loading && searchResults && !autoLoading && <div className="text-center my-8">
                  <div className="animate-spin inline-block w-6 h-6 border-4 border-white dark:border-gray-600 border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-gray-400 dark:text-gray-500">Loading more images...</span>
                </div>}
              
              {searchResults?.searchInformation && <div className="text-center text-sm text-gray-500 mt-4">
                  Found {searchResults.searchInformation.formattedTotalResults} results in {searchResults.searchInformation.formattedSearchTime} seconds
                </div>}
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
