import { useState } from 'react';
import { Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
}
const SearchBar = ({
  onSearch,
  disabled = false
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const {
    toast
  } = useToast();
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

      // Use our Zapier webhook to process the URL
      const zapierEndpoint = `https://hooks.zapier.com/hooks/catch/13559462/2pv14fa/?url=${encodeURIComponent(url)}`;
      try {
        const response = await fetch(zapierEndpoint, {
          method: 'GET'
        });

        // Wait a moment for Zapier to process and send data back to our function
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Now check if our product was received by the Supabase function
        const {
          data: newProducts
        } = await supabase.from('product_data').select('*').eq('product_url', url).limit(1);
        if (newProducts && newProducts.length > 0) {
          const product = newProducts[0];
          toast({
            title: "Product Analyzed",
            description: `Found ${product.brand_name || ''} ${product.product_name || ''}`
          });
          const searchTerm = [product.brand_name, product.product_name].filter(Boolean).join(' ');
          if (searchTerm.trim()) {
            onSearch(searchTerm);
          } else {
            // If somehow we got a product with no brand or name, just use the URL
            onSearch(url);
          }
        } else {
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
      onSearch(trimmedQuery);
    }
  };
  return <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="relative">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Paste URL or search" disabled={disabled || isProcessingUrl} className="w-full pr-12 rounded-full bg-[#EBEBEB] border border-gray-300 text-gray-800 text-lg placeholder:text-[#BDBDBD] focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-md px-[22px] py-[16px]" />
        <button type="submit" disabled={disabled || isProcessingUrl || !query.trim()} aria-label="Search" className="absolute right-4 top-1/2 -translate-y-1/2">
          <Search size={24} className={`${isProcessingUrl ? 'animate-pulse' : ''} text-primary hover:text-primary/80 transition-colors duration-300`} />
        </button>
      </form>
    </div>;
};
export default SearchBar;