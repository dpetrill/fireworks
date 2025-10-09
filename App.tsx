import React from 'react';
import FireworksArcade from './components/FireworksArcade';

// The AdJuice SDK is now loaded via a script tag with the app ID,
// which should handle initialization automatically.
// The global `adjuice` object is still expected to be available for showing ads.
// @ts-ignore
declare const adjuice: any;

const App: React.FC = () => {
    return <FireworksArcade />;
};

export default App;