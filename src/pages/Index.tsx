
import { useState, useEffect } from 'react';
import { useAffiliateRedirect } from '@/hooks/useAffiliateRedirect';
import { useImageSearch } from '@/hooks/useImageSearch';
import { trackEvent } from '@/services/analytics';
import WelcomeScreen from '@/components/WelcomeScreen';
import SearchResultsScreen from '@/components/SearchResultsScreen';
import Footer from '@/components/Footer';
import ErrorAlert from '@/components/ErrorAlert';

const Index = () => {
  const { 
    searchResults, 
    loading, 
    autoLoading, 
    animateResults, 
    error, 
    hasMoreResults, 
    handleSearch, 
    autoLoadMore, 
    resetSearch,
    setAnimateResults 
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
        <WelcomeScreen onSearch={handleSearch} loading={loading} />
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
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
