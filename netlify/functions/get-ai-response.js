// File: netlify/functions/get-ai-response.js
import fetch from 'node-fetch';

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Retrieve the API key from Netlify's environment variables.
  // Ensure your variable in the Netlify UI is named exactly "GEMINI_API_KEY".
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key is not configured on the server.' }) };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt is missing from request.' }) };
    }

    // Use the correct and available Gemini model name.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Google API Error:", responseData);
      const errorMessage = responseData.error?.message || response.statusText;
      return { statusCode: response.status, body: JSON.stringify({ error: `API Error: ${errorMessage}` }) };
    }

    // Extract the text and send a simple, clean response to the frontend.
    const text = responseData.candidates[0].content.parts[0].text;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ text: text }),
    };

  } catch (error) {
    console.error("Serverless Function Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};