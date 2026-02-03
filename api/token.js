export default async function handler(req, res) {
  // 1. Get Secrets from Vercel
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const WORKFLOW_ID = process.env.WORKFLOW_ID; 

  // Debugging: Log if keys are present (DO NOT log the actual keys)
  console.log("Starting Token Exchange...");
  if (!OPENAI_API_KEY) {
    console.error("Error: Missing OPENAI_API_KEY");
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }
  if (!WORKFLOW_ID) {
    console.warn("Warning: Missing WORKFLOW_ID env var. Using fallback.");
  }

  // 2. CORS: Allow your website to talk to Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Connect to Agent Builder
  // ensure you replace this fallback with your ACTUAL workflow ID if the env var fails
  const agentId = WORKFLOW_ID || "wf_696e4bf2f6388190a5be5b9131c25da80d03b88b29395e06"; 
  const userId = "guest-" + Math.random().toString(36).substring(7);

  try {
    const payload = {
        workflow: { id: agentId },
        user: { id: userId },
        // SECURITY UPDATE: OpenAI often requires this for browser-based agents
        trusted_origins: [
            "https://www.grandcafedelaposte.restaurant",
            "http://localhost:3000"
        ]
    };

    console.log("Sending request to OpenAI with Agent ID:", agentId);

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
        // Return the EXACT error to the frontend so we can see it in the console
        return res.status(response.status).json({ error: 'OpenAI Error', details: errorText });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
