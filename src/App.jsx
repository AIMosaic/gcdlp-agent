import React from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import './globals.css'; 

export default function App() {
  const { control } = useChatKit({
    api: {
      // Points to your Vercel API endpoint
      apiURL: '/api/chatkit', 
    },
    theme: {
      colorScheme: 'light',
      // We set base theme variables, but CSS will override buttons
      color: {
        accent: { primary: '#978550' }, 
        background: '#FEF9EE',
        text: '#212326'
      },
      radius: 'sm', // 5px approximation
    },
    header: false, // Hiding default header to use our Custom Header
    newThreadView: {
      // This is the "Main Widget" logic rendered on start
      greeting: "Bienvenue au Grand Café de la Poste. Comment puis-je vous assister ?",
      starterPrompts: [
        { name: "Réserver", prompt: "Je voudrais réserver une table." },
        { name: "Soirées Live", prompt: "Parlez-moi des soirées Soul et Jazz." },
        { name: "La Carte", prompt: "Je souhaiterais voir le menu." }
      ]
    }
  });

  return (
    <div className="flex flex-col h-screen w-full bg-[#FEF9EE]">
      {/* Custom Header with Logo */}
      <div className="custom-header shrink-0">
        <img 
          src="https://www.grandcafedelaposte.restaurant/grandcafedelapos/wp-content/uploads/2025/12/GCDLP_Logo_Icons_Tete_Noire_Right-1-e1769096955816.png" 
          alt="Logo" 
          className="h-10 w-auto"
        />
        <span className="header-title">Votre Concierge Digital</span>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden relative">
        <ChatKit 
          control={control} 
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
