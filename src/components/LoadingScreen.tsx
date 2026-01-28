import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      <img 
        src="./branding/TLOGO.gif" 
        alt="Loading..." 
        className="w-32 h-32 object-contain"
      />
    </div>
  );
};

export default LoadingScreen;
