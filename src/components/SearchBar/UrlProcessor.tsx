
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UrlProcessorProps {
  url: string;
  onComplete: (searchTerm: string) => void;
  onFinish: () => void;
}

const UrlProcessor = ({ url, onComplete, onFinish }: UrlProcessorProps) => {
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const processUrl = async () => {
      setProgress(0);
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
            onComplete(searchTerm);
            onFinish();
            return;
          }
        }

        // Set up progress timer - increments progress over 15 seconds
        const maxWaitTime = 15000; // 15 seconds
        const interval = 300; // Update every 300ms
        const steps = maxWaitTime / interval;
        let currentStep = 0;
        const progressTimer = setInterval(() => {
          currentStep++;
          const newProgress = Math.min(Math.floor(currentStep / steps * 100), 99);
          setProgress(newProgress);
          if (currentStep >= steps) {
            clearInterval(progressTimer);
          }
        }, interval);
        setTimer(progressTimer);

        // Use our Zapier webhook to process the URL
        const zapierEndpoint = `https://hooks.zapier.com/hooks/catch/13559462/2n3nhzi/?url=${encodeURIComponent(url)}`;
        try {
          const response = await fetch(zapierEndpoint, {
            method: 'GET'
          });

          // Wait for Zapier to process and send data back
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
              if (timer) {
                clearInterval(timer);
                setTimer(null);
              }
              setProgress(100);
              toast({
                title: "Product Analyzed",
                description: `Found ${product.brand_name || ''} ${product.product_name || ''}`
              });
              const searchTerm = [product.brand_name, product.product_name]
                .filter(Boolean)
                .join(' ');
                
              if (searchTerm.trim()) {
                onComplete(searchTerm);
                productFound = true;
              } else {
                // If somehow we got a product with no brand or name, just use the URL
                onComplete(url);
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
            onComplete(url);
          }
        } catch (error) {
          console.error("Error with Zapier request:", error);
          toast({
            title: "Processing Error",
            description: "Unable to process product. Searching with URL instead.",
            variant: "destructive"
          });
          onComplete(url);
        }
      } catch (error) {
        console.error('URL processing error:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to process the URL. Please try searching manually.",
          variant: "destructive"
        });
        // Fall back to regular search
        onComplete(url);
      } finally {
        // Clean up timer if it's still running
        if (timer) {
          clearInterval(timer);
          setTimer(null);
        }
        setProgress(0);
        onFinish();
      }
    };

    processUrl();

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // Only depend on url to avoid re-runs

  return (
    <div className="mt-2">
      <ProgressIndicator progress={progress} />
    </div>
  );
};

// Helper component for showing progress
const ProgressIndicator = ({ progress }: { progress: number }) => {
  const { Progress } = require("@/components/ui/progress");
  
  return (
    <>
      <Progress value={progress} className="h-1" />
      <p className="text-xs text-gray-500 mt-1 text-center">Processing product data... {progress}%</p>
    </>
  );
};

export default UrlProcessor;
