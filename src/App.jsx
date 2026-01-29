import React from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import './globals.css'; 

export default function App() {
  const { control } = useChatKit({
    api: {
      // Points to your specific Vercel backend
      apiURL: 'https://gcdlp-agent.vercel.app/api/chatkit', 
    },
    theme: {
      colorScheme: 'light',
      color: {
        accent: { primary: '#978550' }, 
        background: '#FEF9EE',
        text: '#212326'
      },
      radius: 'sm',
    },
    header: false,
    newThreadView: {
      greeting: "Bienvenue au Grand Café de la Poste. Comment puis-je vous assister ?",
      starterPrompts: [
        { name: "Réserver", prompt: "Je voudrais réserver une table." },
        { name: "Soirées Live", prompt: "Parlez-moi des soirées Soul et Jazz." },
        { name: "La Carte", prompt: "Je souhaiterais voir le menu." }
      ]
    }
  });

  return (
    // INLINE STYLES: This explicitly forces the height to 100vh to fix the blank screen
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100%', 
      backgroundColor: '#FEF9EE',
      overflow: 'hidden'
    }}>
      
      {/* Custom Header */}
      <div className="custom-header" style={{ flexShrink: 0 }}>
        <img 
          src="https://www.grandcafedelaposte.restaurant/grandcafedelapos/wp-content/uploads/2025/12/GCDLP_Logo_Icons_Tete_Noire_Right-1-e1769096955816.png" 
          alt="Logo" 
          className="h-10 w-auto"
          style={{ height: '40px', width: 'auto' }}
        />
        <span className="header-title">Votre Concierge Digital</span>
      </div>

      {/* Chat Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ChatKit 
          control={control} 
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}
