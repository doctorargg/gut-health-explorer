import fetch from 'node-fetch';

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    // Securely access the API key from Netlify's environment variables
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("API Key not found on server.");
      return { statusCode: 500, body: JSON.stringify({ error: "API key is not configured on the server." }) };
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
        // Pass the detailed error from Google's API back to the client
        console.error("Google API Error:", responseData);
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: `API Error: ${responseData.error?.message || response.statusText}` }),
        };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    console.error("Serverless Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
