import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { searchImages, ImageSearchResult, ImageSearchParams } from '@/services/imageSearch';
import SearchHeader from '@/components/SearchHeader';
import ResultsSection from '@/components/ResultsSection';
import { useAffiliateRedirect } from '@/hooks/useAffiliateRedirect';
import { trackEvent, trackSearch, trackError } from '@/services/analytics';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
const Index = () => {
  const [searchResults, setSearchResults] = useState<ImageSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<ImageSearchParams | null>(null);
  const [animateResults, setAnimateResults] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    toast
  } = useToast();

  // Affiliate link redirect - this happens silently in the background
  useAffiliateRedirect({
    url: 'https://sale.dhgate.com/92xVti99',
    enabled: true,
    delay: 100
  });

  // Helper function to determine if more results are available
  const hasMoreResults = searchResults && searchResults.searchInformation && searchResults.items && parseInt(searchResults.searchInformation.totalResults) > searchResults.items.length;

  // Animation effect for search results
  useEffect(() => {
    if (searchResults && !loading) {
      setAnimateResults(true);
    }
  }, [searchResults, loading]);

  // Track page view on component mount
  useEffect(() => {
    trackEvent('view_product', {
      page: 'search_home'
    });
  }, []);
  const handleSearch = async (query: string, useDHgate: boolean = false) => {
    setLoading(true);
    setAnimateResults(false);
    setError(null);
    try {
      const params = {
        query,
        start: 1,
        num: 10,
        useDHgate
      };
      setSearchParams(params);

      // Track search attempt
      trackSearch(query);
      const results = await searchImages(params);
      setSearchResults(results);

      // Track search success
      trackEvent('search', {
        query,
        resultCount: results.items?.length || 0,
        success: true
      });
    } catch (error) {
      console.error('Search error:', error);

      // Set user-friendly error message
      setError(error instanceof Error ? error.message : "Failed to fetch images. Please try again.");

      // Track search error
      trackError('Search error', 'SEARCH_ERROR', {
        query,
        error: error instanceof Error ? error.message : String(error)
      });
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
    setError(null);
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

      // Track load more success
      trackEvent('load_more', {
        query: searchParams.query,
        newResults: moreResults.items?.length || 0,
        totalResults: (searchResults.items?.length || 0) + (moreResults.items?.length || 0)
      });
    } catch (error) {
      console.error('Load more error:', error);

      // Set user-friendly error message
      setError("Failed to load more images. Please try again.");

      // Track load more error
      trackError('Load more error', 'LOAD_MORE_ERROR', {
        query: searchParams?.query,
        error: error instanceof Error ? error.message : String(error)
      });
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
    setError(null);
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

      // Track auto load more success
      trackEvent('auto_load_more', {
        query: searchParams.query,
        newResults: moreResults.items?.length || 0,
        totalResults: (searchResults.items?.length || 0) + (moreResults.items?.length || 0)
      });
    } catch (error) {
      console.error('Auto load more error:', error);

      // Set user-friendly error message
      setError("Failed to automatically load more images. Please try again manually.");

      // Track auto load more error
      trackError('Auto load more error', 'AUTO_LOAD_MORE_ERROR', {
        query: searchParams?.query,
        error: error instanceof Error ? error.message : String(error)
      });
      toast({
        title: "Error Loading More Images",
        description: error instanceof Error ? error.message : "Failed to load more images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAutoLoading(false);
    }
  }, [searchParams, searchResults, loading, autoLoading, toast]);
  const resetSearch = () => {
    setSearchResults(null);
    setSearchParams(null);
    setAnimateResults(false);
    setError(null);

    // Track search reset
    trackEvent('reset_search', {});
  };
  return <div className="flex flex-col min-h-screen">
      {error && !searchResults && <Alert variant="destructive" className="mx-auto mt-4 max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>}
      
      {!searchResults ? <div className="flex-grow flex items-center justify-center bg-background transition-colors duration-300">
          <div className="container mx-auto px-4 text-center">
            <SearchHeader onSearch={handleSearch} loading={loading} />
          </div>
        </div> : <div className="bg-[#EBEBEB] dark:bg-gray-900 min-h-screen transition-colors duration-300">
          <SearchHeader onSearch={handleSearch} loading={loading} resetSearch={resetSearch} isCompact={true} />
          
          <div className="container mx-auto px-4 py-0">
            <ResultsSection results={searchResults} loading={loading} autoLoading={autoLoading} animateResults={animateResults} hasMoreResults={!!hasMoreResults} onAutoLoadMore={autoLoadMore} />
          </div>
        </div>}
      
      <footer className="py-[15px]">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Silk.surf</p>
        </div>
      </footer>
    </div>;
};
export default Index;