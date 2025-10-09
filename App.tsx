import React from 'react';
import FireworksArcade from './components/FireworksArcade';

// The AdJuice SDK is now loaded via a script tag with the app ID,
// which should handle initialization automatically.
// The global `adjuice` object is still expected to be available for showing ads.
// @ts-ignore
declare const adjuice: any;

const App: React.FC = () => {
    console.log('App component rendering...');
    
    // Add error boundary
    try {
        return <FireworksArcade />;
    } catch (error) {
        console.error('Error in App component:', error);
        return (
            <div style={{ 
                color: 'white', 
                background: 'black', 
                padding: '20px',
                fontFamily: 'Arial, sans-serif'
            }}>
                <h1>Firework Zen</h1>
                <p>Error loading app: {String(error)}</p>
                <p>Check console for details.</p>
            </div>
        );
    }
};

export default App;