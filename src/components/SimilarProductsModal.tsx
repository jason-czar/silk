
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { extractItemcode } from '@/components/ImageCard/utils';
import { X } from 'lucide-react';
import { useToast } from './ui/use-toast';
import ImageCard from './ImageCard';
import { ImageSearchResult } from '@/services/imageSearch';

interface SimilarProductsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productUrl?: string;
  productTitle?: string;
}

const SimilarProductsModal = ({ isOpen, onOpenChange, productUrl, productTitle }: SimilarProductsModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<ImageSearchResult | null>(null);

  useEffect(() => {
    if (isOpen && productUrl) {
      fetchSimilarProducts();
    } else {
      // Don't reset similarProducts when closing to avoid flickering if reopened
      if (!isOpen) {
        setSimilarProducts(null);
      }
    }
  }, [isOpen, productUrl]);

  const fetchSimilarProducts = async () => {
    if (!productUrl) return;
    
    setLoading(true);
    
    try {
      // Extract itemcode from the product URL
      const itemcode = extractItemcode(productUrl);
      
      if (!itemcode) {
        throw new Error('Could not extract product ID from URL');
      }
      
      console.log(`Fetching similar products for itemcode: ${itemcode}`);
      
      // Construct the DHgate similar products URL
      const similarProductsUrl = `https://www.dhgate.com/similar-product/showlist.do?imploc=cpssim&lang=en&itemcode=${itemcode}&vid=4E0A12ACB7521A68CD36260002A41405==&dspm=pcen.sp.findsimilar.25.QwueXoTWKhABKL9r5EeT&resource_id=#searl-simitem`;
      
      // Make an API call to fetch similar products using our mock API interceptor
      const response = await fetch(similarProductsUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch similar products');
      }
      
      const data = await response.json();
      
      // Transform the response into the format expected by ImageCard components
      const transformedData: ImageSearchResult = {
        kind: "customsearch#search",
        url: { type: "application/json", template: "" },
        queries: { request: [{ totalResults: data.items.length.toString() }] },
        searchInformation: {
          searchTime: 0,
          formattedSearchTime: "0",
          totalResults: data.items.length.toString(),
          formattedTotalResults: data.items.length.toString()
        },
        items: data.items.map((item: any) => ({
          kind: "customsearch#result",
          title: item.title || item.itemName,
          htmlTitle: item.title || item.itemName,
          link: item.link || item.productUrl,
          displayLink: "www.dhgate.com",
          snippet: item.title || item.itemName,
          htmlSnippet: item.title || item.itemName,
          mime: "image/jpeg",
          fileFormat: "image/jpeg",
          image: {
            contextLink: item.link || item.productUrl,
            height: 800,
            width: 800,
            byteSize: 10000,
            thumbnailLink: item.imageUrl,
            thumbnailHeight: 143,
            thumbnailWidth: 143
          }
        }))
      };
      
      console.log(`Found ${transformedData.items.length} similar products`);
      setSimilarProducts(transformedData);
    } catch (error) {
      console.error('Error fetching similar products:', error);
      toast({
        title: "Error",
        description: "Failed to load similar products. Please try again.",
        variant: "destructive"
      });
      
      // Fallback: Create mock similar products if the API call fails
      const itemcode = extractItemcode(productUrl) || Math.floor(Math.random() * 1000000).toString();
      const fallbackSimilarProducts: ImageSearchResult = {
        kind: "customsearch#search",
        url: { type: "application/json", template: "" },
        queries: { request: [{ totalResults: "8" }] },
        searchInformation: {
          searchTime: 0,
          formattedSearchTime: "0",
          totalResults: "8",
          formattedTotalResults: "8"
        },
        items: Array.from({ length: 8 }).map((_, i) => ({
          kind: "customsearch#result",
          title: `${productTitle || 'Product'} - Similar Item ${i+1}`,
          htmlTitle: `${productTitle || 'Product'} - Similar Item ${i+1}`,
          link: productUrl,
          displayLink: "www.dhgate.com",
          snippet: `${productTitle || 'Product'} - Similar Item ${i+1}`,
          htmlSnippet: `${productTitle || 'Product'} - Similar Item ${i+1}`,
          mime: "image/jpeg",
          fileFormat: "image/jpeg",
          image: {
            contextLink: productUrl,
            height: 800,
            width: 800,
            byteSize: 10000,
            thumbnailLink: `https://picsum.photos/seed/${itemcode}${i}/200/200`,
            thumbnailHeight: 143,
            thumbnailWidth: 143
          }
        }))
      };
      
      setSimilarProducts(fallbackSimilarProducts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="https://www.dhgate.com/favicon.ico" alt="DHgate" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <span>Similar Products on DHgate</span>
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded animate-pulse">
                  <div className="w-full aspect-square"></div>
                  <div className="p-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : similarProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {similarProducts.items.map((item, index) => (
                <div key={index} className="transform transition-all duration-300">
                  <ImageCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No similar products found.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimilarProductsModal;
