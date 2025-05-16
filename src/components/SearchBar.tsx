import { useState } from 'react';
import { Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SearchBarProps {
  onSearch: (query: string, useDHgate?: boolean) => void;
  disabled?: boolean;
  showSuggestions?: boolean;
}

const SearchBar = ({
  onSearch,
  disabled = false,
  showSuggestions = false
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingTimer, setProcessingTimer] = useState<NodeJS.Timeout | null>(null);
  const [useDHgate, setUseDHgate] = useState(false);
  const { toast } = useToast();

  const suggestionOptions = [
    "Hermes Birkin",
    "Alo yoga",
    "New Balance 9060",
    "Prada sunglasses"
  ];

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const sendUrlToZapier = async (url: string) => {
    setIsProcessingUrl(true);
    setProcessingProgress(0);
    try {
      toast({
        title: "Processing URL",
        description: "We're analyzing the product from your URL..."
      });

      // First try to check if we already have this product in our database
      const {
        data: existingProducts
      } = await supabase.from('product_data').select('*').eq('product_url', url).limit(1);
      if (existingProducts && existingProducts.length > 0) {
        const product = existingProducts[0];
        toast({
          title: "Product Found",
          description: `Found ${product.brand_name || ''} ${product.product_name || ''}`
        });
        const searchTerm = [product.brand_name, product.product_name].filter(Boolean).join(' ');
        if (searchTerm.trim()) {
          onSearch(searchTerm);
          setIsProcessingUrl(false);
          return;
        }
      }

      // Set up progress timer - increments progress over 15 seconds
      const maxWaitTime = 15000; // 15 seconds
      const interval = 300; // Update every 300ms
      const steps = maxWaitTime / interval;
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const newProgress = Math.min(Math.floor(currentStep / steps * 100), 99);
        setProcessingProgress(newProgress);
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, interval);
      setProcessingTimer(timer);

      // Use our Zapier webhook to process the URL
      const zapierEndpoint = `https://hooks.zapier.com/hooks/catch/13559462/2n3nhzi/?url=${encodeURIComponent(url)}`;
      try {
        const response = await fetch(zapierEndpoint, {
          method: 'GET'
        });

        // Wait a moment for Zapier to process and send data back to our function
        // Extended timeout - wait up to 15 seconds with periodic checks
        let attempts = 0;
        const maxAttempts = 5; // Check every 3 seconds, up to 15 seconds
        let productFound = false;
        while (attempts < maxAttempts && !productFound) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds between checks

          // Check if our product was received by the Supabase function
          const {
            data: newProducts
          } = await supabase.from('product_data').select('*').eq('product_url', url).limit(1);
          if (newProducts && newProducts.length > 0) {
            const product = newProducts[0];

            // Clean up timer
            if (processingTimer) {
              clearInterval(processingTimer);
              setProcessingTimer(null);
            }
            setProcessingProgress(100);
            toast({
              title: "Product Analyzed",
              description: `Found ${product.brand_name || ''} ${product.product_name || ''}`
            });
            const searchTerm = [product.brand_name, product.product_name].filter(Boolean).join(' ');
            if (searchTerm.trim()) {
              onSearch(searchTerm);
              productFound = true;
            } else {
              // If somehow we got a product with no brand or name, just use the URL
              onSearch(url);
              productFound = true;
            }
          }
          attempts++;
        }

        // If we've exhausted all attempts and still no product
        if (!productFound) {
          toast({
            title: "Product Not Found",
            description: "Searching with URL as query instead"
          });
          onSearch(url);
        }
      } catch (error) {
        console.error("Error with Zapier request:", error);
        toast({
          title: "Processing Error",
          description: "Unable to process product. Searching with URL instead.",
          variant: "destructive"
        });
        onSearch(url);
      }
    } catch (error) {
      console.error('URL processing error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process the URL. Please try searching manually.",
        variant: "destructive"
      });
      // Fall back to regular search
      onSearch(query);
    } finally {
      // Clean up timer if it's still running
      if (processingTimer) {
        clearInterval(processingTimer);
        setProcessingTimer(null);
      }
      setProcessingProgress(0);
      setIsProcessingUrl(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const trimmedQuery = query.trim();
    if (isValidUrl(trimmedQuery)) {
      await sendUrlToZapier(trimmedQuery);
    } else {
      onSearch(trimmedQuery, useDHgate);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearch(suggestion, useDHgate);
  };

  return <div className="search-bar-container flex flex-col items-end justify-center">
      <form onSubmit={handleSubmit} className="w-full">
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Paste URL or search" 
          disabled={disabled || isProcessingUrl} 
          className="w-full pr-12 rounded-full bg-[#EBEBEB]
                    border border-gray-300 text-gray-800 text-lg
                    placeholder:text-[#BDBDBD]
                    focus:outline-none
                    focus:border-[#E3231E70]
                    focus:ring-2
                    focus:ring-[#E3231E70]
                    shadow-md
                    px-[22px] py-[16px]" 
        />
        <button 
          type="submit" 
          disabled={disabled || isProcessingUrl || !query.trim()} 
          aria-label="Search" 
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <Search 
            size={24} 
            className={`${isProcessingUrl ? 'animate-pulse' : ''} text-primary hover:text-primary/80 transition-colors duration-300`} 
          />
        </button>
      </form>
      
      {isProcessingUrl && <div className="mt-2">
          <Progress value={processingProgress} className="h-1" />
          <p className="text-xs text-gray-500 mt-1 text-center">Processing product data... {processingProgress}%</p>
        </div>}
      
      {showSuggestions && !isProcessingUrl && (
        <div className="flex flex-wrap gap-2 mt-4 w-full justify-center">
          {suggestionOptions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 bg-[#F1F1F1] hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors duration-200 border border-gray-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>;
};

export default SearchBar;
