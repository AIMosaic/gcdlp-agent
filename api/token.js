// FILENAME: api/token.js
export default async function handler(req, res) {
  // 1. Get Secrets from Vercel
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const WORKFLOW_ID = process.env.WORKFLOW_ID; 

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }

  // 2. CORS: Allow Vercel to talk to itself (Essential for the Iframe)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Connect to Agent Builder
  // We use a random guest ID for the session
  const agentId = WORKFLOW_ID || "wf_696e4bf2f6388190a5be5b9131c25da80d03b88b29395e06"; 
  const userId = "guest-" + Math.random().toString(36).substring(7);

  try {
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1'
      },
      body: JSON.stringify({
        workflow: { id: agentId },
        user: { id: userId }
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: 'Failed to fetch token', details: errorText });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
