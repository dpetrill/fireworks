import React, { useEffect } from 'react';

const Ad: React.FC = () => {
  useEffect(() => {
    // AdJuice script looks for a container and injects the ad.
    // This effect ensures the script is added to the container when the component mounts.
    const container = document.getElementById('adjuice-banner-container');

    // Only add the script if the container is present and empty.
    // This prevents adding multiple scripts if the component re-renders.
    if (container && !container.hasChildNodes()) {
      const script = document.createElement('script');
      // This script is specifically for the banner placement.
      script.src = 'https://adjuice.app/api/sdk?app_id=ac26af26-9062-4b5e-8e59-ef8ea9bb8c2e&placement=banner';
      script.async = true;
      container.appendChild(script);
    }
  }, []);

  // The container div that the AdJuice script will target.
  // Using a specific ID is good practice to avoid conflicts.
  return <div id="adjuice-banner-container" className="w-full h-full"></div>;
};

export default Ad;
