import React from 'react';

const ViewLoading: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950">
      <div className="flex items-center gap-2 text-zinc-500">
        <span className="material-symbols-rounded animate-spin">sync</span>
        <span className="text-xs font-medium">Loading view...</span>
      </div>
    </div>
  );
};

export default ViewLoading;
