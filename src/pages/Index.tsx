import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { ArrowDownCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import ImageGrid from '@/components/ImageGrid';
import { searchImages, ImageSearchResult, ImageSearchParams } from '@/services/imageSearch';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [searchResults, setSearchResults] = useState<ImageSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<ImageSearchParams | null>(null);
  const isMobile = useIsMobile();
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
  };
  
  const hasMoreResults = searchResults && searchResults.searchInformation && searchResults.items && parseInt(searchResults.searchInformation.totalResults) > searchResults.items.length;
  
  return <div className="flex flex-col min-h-screen">
      {!searchResults ? <div className="flex-grow flex items-center justify-center bg-background">
          <div className="container mx-auto px-4 text-center">
            <header className="mb-12 -mt-[25px]">
              <div className="flex justify-center mb-8">
                <svg className="h-12 md:h-14" viewBox="0 0 230 85" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M36.5 70.8C26.7 70.8 19.3 68.3 14.2 63.3C9.1 58.2 6.6 50.7 6.6 40.8V39.7C6.6 29.8 9.1 22.3 14.2 17.3C19.3 12.2 26.7 9.7 36.5 9.7C44.1 9.7 50.5 11.1 55.7 14C61 16.8 64.4 20.9 65.9 26.2L49.5 32.2C48.7 29.9 47.3 28.1 45.3 26.8C43.3 25.4 40.6 24.7 37.1 24.7C32.4 24.7 28.9 26.1 26.7 28.8C24.6 31.4 23.5 35.1 23.5 39.8V40.9C23.5 45.6 24.6 49.3 26.7 51.9C28.9 54.5 32.4 55.9 37.1 55.9C40.8 55.9 43.7 55.2 45.7 53.8C47.7 52.3 49 50.4 49.6 48L65.9 53.9C64.5 59.3 61 63.4 55.6 66.2C50.3 69.3 44 70.8 36.5 70.8Z" fill="#33D17A"/>
                  <path d="M81.5 15.3C78.8 15.3 76.7 14.6 75.1 13.1C73.6 11.6 72.8 9.7 72.8 7.2C72.8 4.7 73.6 2.7 75.1 1.2C76.7 -0.3 78.8 -1 81.5 -1C84.1 -1 86.2 -0.3 87.8 1.2C89.3 2.7 90.1 4.7 90.1 7.2C90.1 9.7 89.3 11.6 87.8 13.1C86.2 14.6 84.1 15.3 81.5 15.3ZM73.6 69.8V22.6H89.2V69.8H73.6Z" fill="#33D17A"/>
                  <path d="M113.7 15.3C111 15.3 108.9 14.6 107.3 13.1C105.8 11.6 105 9.7 105 7.2C105 4.7 105.8 2.7 107.3 1.2C108.9 -0.3 111 -1 113.7 -1C116.3 -1 118.4 -0.3 120 1.2C121.5 2.7 122.3 4.7 122.3 7.2C122.3 9.7 121.5 11.6 120 13.1C118.4 14.6 116.3 15.3 113.7 15.3ZM105.8 69.8V22.6H121.4V69.8H105.8Z" fill="#33D17A"/>
                  <path d="M167.2 23.5L157.6 69.8H140.8L124.8 0.9H141.2L150.4 47.9L160.3 0.9H174.1L184.1 47.9L193.1 0.9H209.5L193.5 69.8H176.9L167.2 23.5Z" fill="#33D17A"/>
                </svg>
              </div>
              <p className="text-gray-600 mb-16 text-2xl px-[42px]">Find similar products - at factory direct prices.</p>
              <SearchBar onSearch={handleSearch} disabled={loading} />
            </header>
          </div>
        </div> : <div className="bg-[#EBEBEB] min-h-screen">
          <div className="bg-background py-[14px]">
            <div className="container mx-auto px-4">
              <header className="flex items-center mb-4">
                <div className={`${isMobile ? 'mr-2' : 'mr-8'}`}>
                  <div onClick={resetSearch} className="cursor-pointer">
                    {/* SVG version of the hashtag logo */}
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24.8889 4L19.5556 28M12.4444 4L7.11111 28M28 10.6667H4M28 21.3333H4" stroke="#333333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
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
              
              {searchResults && !loading && hasMoreResults && <div className="flex justify-center mt-8 mb-12">
                  <button onClick={loadMore} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full hover:opacity-90 transition-colors shadow-md">
                    <span>Load More</span>
                    <ArrowDownCircle size={20} />
                  </button>
                </div>}
              
              {loading && searchResults && <div className="text-center my-8">
                  <div className="animate-spin inline-block w-6 h-6 border-4 border-white border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-gray-400">Loading more images...</span>
                </div>}
              
              {searchResults?.searchInformation && <div className="text-center text-sm text-gray-400 mt-8">
                  Found {searchResults.searchInformation.formattedTotalResults} results 
                  ({searchResults.searchInformation.formattedSearchTime} seconds)
                </div>}
            </main>
          </div>
        </div>}
      
      <footer className={`${searchResults ? 'bg-[#EBEBEB]' : 'bg-background'} mt-auto py-[5px]`}>
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 Silk.surf</p>
        </div>
      </footer>
    </div>;
};
export default Index;
