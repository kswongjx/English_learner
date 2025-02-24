import { serve } from "https://deno.land/std@0.220.1/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const ZWEI_API_KEY = Deno.env.get("ZWEI_API_KEY");
const DASHSCOPE_API_KEY = Deno.env.get("DASHSCOPE_API_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const service = url.pathname.split('/')[1];

  try {
    let apiUrl, apiKey, headers;
    const body = req.body ? await req.json() : null;

    switch(service) {
      case 'gemini':
        apiUrl = `https://api-proxy.me/gemini/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        apiKey = GEMINI_API_KEY;
        headers = { "Content-Type": "application/json" };
        
        const response = await fetch(apiUrl, {
          method: req.method,
          headers: headers,
          body: JSON.stringify(body)
        });
        const responseData = await response.json();
        return new Response(JSON.stringify(responseData), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });

      case 'zwei':
        apiUrl = "https://otts.api.zwei.de.eu.org/v1/audio/speech";
        apiKey = ZWEI_API_KEY;
        headers = { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        };
        
        const audioResponse = await fetch(apiUrl, {
          method: req.method,
          headers: headers,
          body: JSON.stringify(body)
        });
        
        // Return audio data with correct headers
        return new Response(audioResponse.body, {
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "audio/mpeg",
            "Content-Disposition": "attachment; filename=speech.mp3"
          }
        });

      case 'dashscope':
        apiUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
        apiKey = DASHSCOPE_API_KEY;
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        };
        
        const daskscopeResponse = await fetch(apiUrl, {
          method: req.method,
          headers: headers,
          body: JSON.stringify(body)
        });
        const daskscopeData = await daskscopeResponse.json();
        return new Response(JSON.stringify(daskscopeData), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });

      default:
        return new Response("Invalid service", { 
          status: 400,
          headers: CORS_HEADERS
        });
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
}); 