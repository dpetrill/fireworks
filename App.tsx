import React from 'react';

// The AdJuice SDK is now loaded via a script tag with the app ID,
// which should handle initialization automatically.
// The global `adjuice` object is still expected to be available for showing ads.
// @ts-ignore
declare const adjuice: any;

const App: React.FC = () => {
    console.log('App component rendering...');
    
    // Simple test to see if React is working
    return (
        <div style={{ 
            color: 'white', 
            background: 'black', 
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            minHeight: '100vh'
        }}>
            <h1>🎆 Firework Zen</h1>
            <p>React is working! Loading the full app...</p>
            <p>If you see this, the basic setup is working.</p>
        </div>
    );
};

export default App;