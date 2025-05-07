
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SearchInput from './SearchInput';
import ProgressIndicator from './ProgressIndicator';
import { readFileAsBase64, validateImageFile } from '../ImageUpload/utils';

interface SearchBarProps {
  onSearch: (query: string, useDHgate?: boolean) => void;
  disabled?: boolean;
}

const SearchBar = ({
  onSearch,
  disabled = false
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingTimer, setProcessingTimer] = useState<NodeJS.Timeout | null>(null);
  const [useDHgate, setUseDHgate] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { toast } = useToast();

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
      const { data: existingProducts } = await supabase
        .from('product_data')
        .select('*')
        .eq('product_url', url)
        .limit(1);

      if (existingProducts && existingProducts.length > 0) {
        const product = existingProducts[0];
        toast({
          title: "Product Found",
          description: `Found ${product.brand_name || ''} ${product.product_name || ''}`
        });
        const searchTerm = [product.brand_name, product.product_name]
          .filter(Boolean)
          .join(' ');
          
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
          const { data: newProducts } = await supabase
            .from('product_data')
            .select('*')
            .eq('product_url', url)
            .limit(1);
            
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
            const searchTerm = [product.brand_name, product.product_name]
              .filter(Boolean)
              .join(' ');
              
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

  const handleCameraClick = () => {
    setShowImageDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!validateImageFile(file)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessingImage(true);
    try {
      toast({
        title: "Processing Image",
        description: "Please wait while we analyze your image..."
      });

      // Convert image to base64
      const base64data = await readFileAsBase64(selectedFile);
      
      // Send to our edge function
      const response = await fetch("https://jzupbllxgtobpykyerbi.supabase.co/functions/v1/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64data }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to process image");
      }

      // Use the labels returned from the Vision API
      if (data.labels && data.labels.length > 0) {
        // Use the top 3 labels for the search
        const searchQuery = data.labels.slice(0, 3).map((label: any) => label.description).join(' ');
        
        toast({
          title: "Image Analysis Complete",
          description: `Found: ${searchQuery}`
        });
        
        onSearch(searchQuery);
        closeImageDialog();
      } else {
        throw new Error("No labels detected in the image");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const closeImageDialog = () => {
    setShowImageDialog(false);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="search-bar-container">
      <SearchInput
        query={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
        isProcessing={isProcessingUrl}
        onSubmit={handleSubmit}
        onCameraClick={handleCameraClick}
      />
      
      <ProgressIndicator 
        isProcessing={isProcessingUrl}
        progress={processingProgress}
      />

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <h3 className="text-lg font-medium">Search with an image</h3>
          <div className="flex flex-col items-center justify-center space-y-4">
            <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center p-4">
                <p className="text-sm text-gray-500">
                  {preview ? 'Change image' : 'Click to select an image or drag and drop'}
                </p>
              </div>
              <input 
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isProcessingImage}
              />
            </label>
            
            {preview && (
              <div className="relative h-48 w-48 overflow-hidden rounded-md">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            
            <div className="flex gap-2 w-full justify-end">
              <button 
                onClick={closeImageDialog}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                disabled={isProcessingImage}
              >
                Cancel
              </button>
              <button 
                onClick={processImage} 
                disabled={!selectedFile || isProcessingImage}
                className="px-4 py-2 bg-[#4285F4] text-white rounded-md hover:bg-[#4285F4]/90 disabled:bg-gray-300"
              >
                {isProcessingImage ? "Processing..." : "Search"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchBar;
