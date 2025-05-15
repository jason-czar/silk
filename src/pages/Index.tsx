
import { useState, useEffect } from 'react';
import { useAffiliateRedirect } from '@/hooks/useAffiliateRedirect';
import { useImageSearch } from '@/hooks/useImageSearch';
import { trackEvent } from '@/services/analytics';
import WelcomeScreen from '@/components/WelcomeScreen';
import SearchResultsScreen from '@/components/SearchResultsScreen';
import Footer from '@/components/Footer';
import ErrorAlert from '@/components/ErrorAlert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Index = () => {
  const { 
    searchResults, 
    loading, 
    autoLoading, 
    animateResults, 
    error, 
    hasMoreResults, 
    preferHighQuality,
    handleSearch, 
    autoLoadMore, 
    resetSearch,
    setAnimateResults,
    toggleQualityPreference 
  } = useImageSearch();

  // Affiliate link redirect - this happens silently in the background
  useAffiliateRedirect({
    url: 'https://sale.dhgate.com/92xVti99',
    enabled: true,
    delay: 100
  });

  // Animation effect for search results
  useEffect(() => {
    if (searchResults && !loading) {
      setAnimateResults(true);
    }
  }, [searchResults, loading, setAnimateResults]);

  // Track page view on component mount
  useEffect(() => {
    trackEvent('view_product', {
      page: 'search_home'
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {error && !searchResults && (
        <ErrorAlert title="Search Error" description={error} />
      )}
      
      {!searchResults ? (
        <div>
          <WelcomeScreen onSearch={handleSearch} loading={loading} />
          <div className="max-w-3xl mx-auto mt-4 flex items-center justify-end px-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="quality-preference" 
                checked={preferHighQuality}
                onCheckedChange={toggleQualityPreference}
              />
              <Label htmlFor="quality-preference">Prefer high-quality images</Label>
            </div>
          </div>
        </div>
      ) : (
        <SearchResultsScreen
          searchResults={searchResults}
          loading={loading}
          autoLoading={autoLoading}
          animateResults={animateResults}
          hasMoreResults={!!hasMoreResults}
          onSearch={handleSearch}
          resetSearch={resetSearch}
          onAutoLoadMore={autoLoadMore}
          preferHighQuality={preferHighQuality}
          onToggleQualityPreference={toggleQualityPreference}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
