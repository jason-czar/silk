
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
const handleCors = (request: Request): Response | null => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
};

serve(async (request: Request) => {
  // Handle CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  try {
    // Create a Supabase client with the admin key (needed to access secrets)
    const supabaseClient = createClient(
      // Supabase API URL - env var set by default in Deno Edge Functions
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase service role key - env var set by default in Deno Edge Functions
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    
    // Fetch the DHgate credentials from Supabase secrets
    const { data, error } = await supabaseClient.functions.fetchSecrets([
      "DHGATE_APP_KEY",
      "DHGATE_APP_SECRET",
      "DHGATE_USERNAME",
      "DHGATE_PASSWORD"
    ]);
    
    if (error) {
      throw new Error(`Failed to fetch secrets: ${error.message}`);
    }
    
    // Return the DHgate credentials as a JSON response
    return new Response(
      JSON.stringify({
        app_key: data.DHGATE_APP_KEY,
        app_secret: data.DHGATE_APP_SECRET,
        username: data.DHGATE_USERNAME,
        password: data.DHGATE_PASSWORD
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
