// FILENAME: api/token.js
export default async function handler(req, res) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const WORKFLOW_ID = process.env.WORKFLOW_ID;

  // 1. Check if Keys exist on Vercel
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  if (!WORKFLOW_ID) return res.status(500).json({ error: 'Missing WORKFLOW_ID in Vercel Env Vars' });

  // 2. Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 3. Call OpenAI (ChatKit)
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1'
      },
      body: JSON.stringify({ workflow: { id: WORKFLOW_ID } }),
    });

    // 4. IF IT FAILS: Print the EXACT error message to the screen
    if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
            status: "OpenAI Rejected Request",
            sent_workflow_id: WORKFLOW_ID, // Verify the ID being sent
            openai_error: errorText // <--- THIS IS WHAT WE NEED
        });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
