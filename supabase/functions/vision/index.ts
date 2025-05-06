
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

// Set up CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Get the API key from Supabase secrets
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Retrieve the Google Cloud Vision API key from secrets
    const { data: secretData, error: secretError } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', 'GOOGLE_CLOUD_API_KEY')
      .single();

    if (secretError || !secretData) {
      console.error("Error retrieving Google Cloud API Key:", secretError);
      return new Response(
        JSON.stringify({ error: "Could not retrieve API key" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const GOOGLE_CLOUD_API_KEY = secretData.value;

    // Call the Vision API
    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_API_KEY}`;
    
    const response = await fetch(visionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: image
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 10
              },
              {
                type: 'WEB_DETECTION',
                maxResults: 5
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Vision API Error:", errorData);
      return new Response(
        JSON.stringify({ error: "Error from Vision API" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status 
        }
      );
    }

    const visionData = await response.json();

    // Process labels and web entities from the response
    const labels = visionData.responses[0]?.labelAnnotations || [];
    const webEntities = visionData.responses[0]?.webDetection?.webEntities || [];
    
    // Combine different types of results to create a more comprehensive search
    const combinedLabels = [
      ...labels,
      ...webEntities.map((entity: any) => ({ 
        description: entity.description,
        score: entity.score
      }))
    ].sort((a: any, b: any) => b.score - a.score);

    return new Response(
      JSON.stringify({ labels: combinedLabels }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
