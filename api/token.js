export default async function handler(req, res) {
  // 1. Get Secrets from Vercel
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  // Use the ID from your environment variables, or fallback to the one you provided
  const WORKFLOW_ID = process.env.WORKFLOW_ID || "wf_696e4bf2f6388190a5be5b9131c25da80d03b88b29395e06";

  if (!OPENAI_API_KEY) {
    console.error("Error: Missing OPENAI_API_KEY");
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }

  // 2. CORS: Allow your website to talk to Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Connect to Agent Builder
  const userId = "guest-" + Math.random().toString(36).substring(7);

  try {
    // FIX: The Hybrid Payload Structure
    // - "workflow" is an OBJECT { id: ... }
    // - "user" is a STRING
    const payload = {
        workflow: { id: WORKFLOW_ID }, 
        user: userId           
    };

    console.log("Sending request to OpenAI with Agent ID:", WORKFLOW_ID);

    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1' 
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", response.status, errorText);
        // Return the EXACT error to the frontend for debugging
        return res.status(response.status).json({ error: 'OpenAI Error', details: errorText });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
