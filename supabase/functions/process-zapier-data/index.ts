
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  brand_name?: string;
  product_name?: string;
  product_image_url?: string;
  product_url?: string;
  price?: number;
  currency?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request data
    const requestData = await req.json();
    console.log("Received data from Zapier:", JSON.stringify(requestData));

    // Process URL if present in request
    if (requestData.url) {
      console.log("Processing URL:", requestData.url);
      // The data will be processed by Zapier and returned to us, so we don't need to do anything here
    }

    // Extract product information from request
    const productData: ProductData = {
      brand_name: requestData.brand_name,
      product_name: requestData.product_name,
      product_image_url: requestData.product_image_url,
      product_url: requestData.product_url,
      price: requestData.price ? parseFloat(requestData.price) : undefined,
      currency: requestData.currency || 'USD'
    };

    // Check if we have at least some data to store
    if (productData.brand_name || productData.product_name) {
      // Insert data into Supabase
      const { data, error } = await supabase
        .from('product_data')
        .insert(productData);

      if (error) {
        console.error("Error storing product data:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log("Product data stored successfully:", data);

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Product data processed successfully",
          product_data: productData
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    } else {
      // Return the original data for further processing in the frontend
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No product data found to store",
          original_data: requestData
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
