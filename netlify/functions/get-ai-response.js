// File: netlify/functions/get-ai-response.js
import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Check if the API key is configured
  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key is not configured on the server.' }) };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt is missing from request.' }) };
    }

    // Make the API call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // A powerful and cost-effective model
      messages: [{ role: "user", content: prompt }],
    });

    // Extract the text from the response
    const text = response.choices[0].message.content;
    
    // Send the successful response back to the frontend
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text }),
    };

  } catch (error) {
    // Log the detailed error and send a generic message to the client
    console.error("OpenAI API or Function Error:", error);
    return { 
      statusCode: error.status || 500, 
      body: JSON.stringify({ error: `An error occurred with the AI service: ${error.message}` }) 
    };
  }
};
