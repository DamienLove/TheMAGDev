import React from 'react';

const ViewLoading: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-zinc-800 border-t-indigo-500"></div>
    </div>
  );
};

export default ViewLoading;
