
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { searchImages, ImageSearchResult, ImageSearchParams } from '@/services/imageSearch';
import { trackEvent, trackSearch, trackError } from '@/services/analytics';

export const useImageSearch = () => {
  const [searchResults, setSearchResults] = useState<ImageSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<ImageSearchParams | null>(null);
  const [animateResults, setAnimateResults] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferHighQuality, setPreferHighQuality] = useState<boolean>(true);
  const { toast } = useToast();

  // Helper function to determine if more results are available
  const hasMoreResults = searchResults && 
    searchResults.searchInformation && 
    searchResults.items && 
    parseInt(searchResults.searchInformation.totalResults) > searchResults.items.length;

  const handleSearch = async (query: string, useDHgate: boolean = false) => {
    setLoading(true);
    setAnimateResults(false);
    setError(null);
    try {
      const params = {
        query,
        start: 1,
        num: 10,
        useDHgate,
        preferHighQuality
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
        success: true,
        qualityPreference: preferHighQuality
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
        totalResults: (searchResults.items?.length || 0) + (moreResults.items?.length || 0),
        qualityPreference: preferHighQuality
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

  const autoLoadMore = async () => {
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
        totalResults: (searchResults.items?.length || 0) + (moreResults.items?.length || 0),
        qualityPreference: preferHighQuality
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
  };

  const resetSearch = () => {
    setSearchResults(null);
    setSearchParams(null);
    setAnimateResults(false);
    setError(null);

    // Track search reset
    trackEvent('reset_search', {
      qualityPreference: preferHighQuality
    });
  };
  
  // New function to toggle quality preference
  const toggleQualityPreference = () => {
    setPreferHighQuality(prev => !prev);
    
    // Track preference change
    trackEvent('toggle_quality_preference', {
      newPreference: !preferHighQuality ? 'high' : 'standard'
    });
    
    // Notify the user
    toast({
      title: `Image Quality: ${!preferHighQuality ? 'High' : 'Standard'}`,
      description: `Search will now return ${!preferHighQuality ? 'higher' : 'standard'} quality images.`,
    });
  };

  return {
    searchResults,
    loading,
    autoLoading,
    animateResults,
    error,
    hasMoreResults,
    preferHighQuality,
    handleSearch,
    loadMore,
    autoLoadMore,
    resetSearch,
    setAnimateResults,
    toggleQualityPreference
  };
};
