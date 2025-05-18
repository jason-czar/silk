
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Fetching HTML for product URL: ${url}`);

    // Fetch the product page HTML
    const response = await fetch(url, {
      headers: {
        // Use a common user agent to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch HTML: ${response.status} ${response.statusText}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
      );
    }

    // Get the HTML content
    const html = await response.text();
    
    // Extract image URLs from preload tags
    const preloadImageRegex = /<link rel="preload" as="image"[^>]*href="([^"]*)"[^>]*>/g;
    const matches = [...html.matchAll(preloadImageRegex)];
    
    // Transform URLs to replace 100x100 with 0x0 for higher quality
    const imageUrls = matches.map(match => {
      const url = match[1];
      return url.replace(/\/100x100\//, '/0x0/');
    });

    // Filter out duplicate URLs
    const uniqueImageUrls = [...new Set(imageUrls)];
    
    console.log(`Found ${uniqueImageUrls.length} unique image URLs`);

    return new Response(
      JSON.stringify({ 
        imageUrls: uniqueImageUrls,
        totalFound: uniqueImageUrls.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching product HTML:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
