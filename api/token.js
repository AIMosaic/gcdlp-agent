// FILENAME: api/token.js
export default async function handler(req, res) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const WORKFLOW_ID = process.env.WORKFLOW_ID;

  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  if (!WORKFLOW_ID) return res.status(500).json({ error: 'Missing WORKFLOW_ID' });

  // 1. CORS: Allow your Staging Site to talk to Vercel
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userID = "guest-" + Math.random().toString(36).substring(7);

  try {
    // 2. Call OpenAI with "trusted_origins"
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1'
      },
      body: JSON.stringify({ 
        workflow: { id: WORKFLOW_ID },
        user: userID,
        
        // --- THE MAGIC FIX ---
        // We explicitly tell OpenAI to trust your website.
        // Note: We use the ROOT domain (Origin), not the full path.
        trusted_origins: [
            "https://www.grandcafedelaposte.restaurant",
            "https://grandcafedelaposte.restaurant"
        ]
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
            status: "OpenAI Rejected", 
            error: errorText 
        });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
