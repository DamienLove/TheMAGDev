import React, { useState } from 'react';
import StudioNav, { StudioView } from './studio/StudioNav';
import UIUXDesign from './studio/UIUXDesign';
import AssetsManager from './studio/AssetsManager';
import StudioStore from './studio/StudioStore';

const DesignStudio: React.FC = () => {
  const [activeView, setActiveView] = useState<StudioView>('UI_UX');

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Studio Sub-Navigation Bar */}
      <StudioNav activeView={activeView} onViewChange={setActiveView} />

      {/* View Content Rendering */}
      <div className="flex-1 flex overflow-hidden">
        {activeView === 'UI_UX' && <UIUXDesign />}
        {activeView === 'ASSETS' && <AssetsManager />}
        {activeView === 'STORE' && <StudioStore />}
      </div>
    </div>
  );
};

export default DesignStudio;