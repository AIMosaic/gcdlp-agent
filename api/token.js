// FILENAME: api/token.js
export default async function handler(req, res) {
  // 1. Get the API Key from Vercel Environment Variables
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server Error: Missing API Key' });
  }

  // 2. Handle CORS (Allow your WordPress site)
  const allowedOrigins = [
    'https://grandcafedelaposte.restaurant', 
    'https://www.grandcafedelaposte.restaurant',
    'http://localhost:3000' 
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Optional: allow all for testing, but restrict for production
    res.setHeader('Access-Control-Allow-Origin', '*'); 
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Connect to Agent Builder (ChatKit)
  // We need your Workflow ID here. 
  // You can hardcode it below OR add it to Vercel Env Vars as WORKFLOW_ID.
  const WORKFLOW_ID = process.env.WORKFLOW_ID || "wf_REPLACE_WITH_YOUR_ID"; 

  try {
    // [cite: 464, 468] Using the ChatKit session endpoint
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1' // [cite: 468] Required for ChatKit
      },
      body: JSON.stringify({
        workflow: { id: WORKFLOW_ID }, // [cite: 472] Connects to your specific agent
        // user: "user-unique-id" // Optional: Pass a user ID if you want to track users
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", errorText);
        return res.status(response.status).json({ error: 'Failed to fetch token from OpenAI' });
    }

    const data = await response.json();
    // Return the client_secret to the frontend
    res.status(200).json(data);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
