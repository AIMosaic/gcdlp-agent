// FILENAME: api/token.js
// This is a "Serverless Function" ready for Vercel.

export default async function handler(req, res) {
  // 1. Get the API Key
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server Error: Missing API Key' });
  }

  // 2. Handle CORS (Allow your website)
  const allowedOrigins = [
    'https://grandcafedelaposte.restaurant', 
    'https://www.grandcafedelaposte.restaurant',
    'http://localhost:3000' 
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. THE BRAIN (Instructions for the Agent)
  // This tells the AI who it is and how to behave.
  const SYSTEM_INSTRUCTIONS = `
    You are the "Grand Café Concierge," a digital Maître d' for Grand Café de la Poste in Marrakech.
    Tone: Welcoming, Sophisticated, French-Moroccan Hospitality.
    Languages: French (primary), English (if user speaks it).
    
    KEY KNOWLEDGE:
    - History: Built 1920 (former Post Office), renovated 2005 by Studio KO. Located in Guéliz.
    - Atmosphere: Colonial chic, Brasserie (downstairs), Intimate Salon/Live Music (upstairs).
    - Cuisine: French Brasserie with Moroccan accents (Oysters from Oualidia, Beef Filet).
    - Music: Live Band (Jazz/Soul) in the evenings.
    
    ACTIONS:
    - If user asks to book/reserve: Trigger "get_reservation_link".
    - If user asks about Soul/Jazz night specifically: Trigger "get_music_reservation".
    - If user asks for private events/groups: Trigger "contact_events_team".
    
    RULES:
    - Be concise but warm ("Avec plaisir", "Bienvenue").
    - Never invent menu items.
    - Direct specific booking queries to the buttons provided in the UI.
  `;

  // 4. The Logic: Call OpenAI to get a Session Token
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-10-01",
        voice: "alloy",
        instructions: SYSTEM_INSTRUCTIONS, // <--- CRITICAL ADDITION
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", errorText);
        return res.status(response.status).json({ error: 'Failed to fetch token from OpenAI' });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
