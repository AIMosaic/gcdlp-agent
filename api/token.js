// FILENAME: api/token.js
// This is a "Serverless Function" ready for Vercel.

// IMPORTANT: You must install node-fetch if running locally, 
// but Vercel handles dependencies via package.json automatically.

export default async function handler(req, res) {
  // 1. Get the API Key from Vercel Environment Variables
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server Error: Missing API Key' });
  }

  // 2. Handle CORS (Security) - Allows your website to talk to this server
  const allowedOrigins = [
    'https://grandcafedelaposte.restaurant', 
    'https://www.grandcafedelaposte.restaurant',
    'http://localhost:3000' // For testing
  ];
  
  const origin = req.headers.origin;
  
  // Set headers to allow the browser to accept the response
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Optional: Allow all for development, but restrict for production
    res.setHeader('Access-Control-Allow-Origin', '*'); 
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // If it's just a browser checking "Can I connect?", say Yes.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. The Logic: Call OpenAI to get a Session Token
  try {
    // NOTE: This endpoint uses the OpenAI Realtime/Session API structure.
    // If you are using a standard Chat Completion, you might proxy the request differently.
    // For standard ChatKit with Agent Builder, we often just need a valid ephemeral key.
    
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type':
