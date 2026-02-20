import React from 'react';

const ViewLoading: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-500 h-full">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-xs font-medium uppercase tracking-widest">Loading View...</span>
      </div>
    </div>
  );
};

export default ViewLoading;
