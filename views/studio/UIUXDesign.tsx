import React, { useState } from 'react';

type DeviceCategory = 'phone' | 'tablet' | 'desktop';
type DeviceOS = 'ios' | 'android' | 'macos' | 'windows' | 'chromeos';
type ComponentType = 'button' | 'input' | 'card' | 'text' | 'image' | 'switch';

interface DeviceConfig {
  id: string;
  name: string;
  category: DeviceCategory;
  os: DeviceOS;
  width: number;
  height: number;
  icon: string;
}

interface UIComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  style: React.CSSProperties;
}

const DEVICES: DeviceConfig[] = [
  { id: 'iphone-14', name: 'iPhone 14', category: 'phone', os: 'ios', width: 320, height: 650, icon: 'smartphone' },
  { id: 'pixel-7', name: 'Pixel 7', category: 'phone', os: 'android', width: 340, height: 680, icon: 'android' },
  { id: 'ipad-pro', name: 'iPad Pro', category: 'tablet', os: 'ios', width: 700, height: 500, icon: 'tablet_mac' },
  { id: 'galaxy-tab', name: 'Galaxy Tab', category: 'tablet', os: 'android', width: 720, height: 520, icon: 'tablet_android' },
  { id: 'macbook', name: 'MacBook Air', category: 'desktop', os: 'macos', width: 850, height: 550, icon: 'laptop_mac' },
];

const DEFAULT_COMPONENTS: Record<ComponentType, Partial<UIComponent>> = {
  button: { type: 'button', props: { label: 'Button' }, style: { backgroundColor: '#4f46e5', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', border: 'none', width: '100%' } },
  input: { type: 'input', props: { placeholder: 'Enter text...' }, style: { padding: '10px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#fff', width: '100%' } },
  card: { type: 'card', props: {}, style: { backgroundColor: '#18181b', padding: '20px', borderRadius: '12px', width: '100%', minHeight: '100px', border: '1px solid #27272a' } },
  text: { type: 'text', props: { content: 'Heading Text' }, style: { fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' } },
  image: { type: 'image', props: { src: 'https://via.placeholder.com/150' }, style: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' } },
  switch: { type: 'switch', props: { checked: false }, style: { display: 'flex', alignItems: 'center', gap: '8px' } },
};

const UIUXDesign: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(DEVICES[0]);
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory>('phone');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [components, setComponents] = useState<UIComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState('select');
  const [showToast, setShowToast] = useState(false);

  const filteredDevices = DEVICES.filter(d => d.category === selectedCategory);
  const selectedComponent = components.find(c => c.id === selectedComponentId);

  const handleExport = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    console.log('Exporting Schema:', JSON.stringify(components, null, 2));
  };

  const addComponent = (type: ComponentType) => {
    const newComponent: UIComponent = {
      id: Date.now().toString(),
      type,
      props: { ...DEFAULT_COMPONENTS[type].props },
      style: { ...DEFAULT_COMPONENTS[type].style },
    };
    setComponents([...components, newComponent]);
    setSelectedComponentId(newComponent.id);
  };

  const updateComponent = (id: string, updates: Partial<UIComponent> | { style: Partial<React.CSSProperties> } | { props: Partial<Record<string, any>> }) => {
    setComponents(prev => prev.map(c => {
      if (c.id !== id) return c;
      if ('style' in updates) return { ...c, style: { ...c.style, ...updates.style } };
      if ('props' in updates) return { ...c, props: { ...c.props, ...updates.props } };
      return { ...c, ...updates };
    }));
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (selectedComponentId === id) setSelectedComponentId(null);
  };

  const renderComponent = (component: UIComponent) => {
    const isSelected = selectedComponentId === component.id;
    const commonProps = {
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); setSelectedComponentId(component.id); },
        style: { ...component.style, outline: isSelected ? '2px solid #6366f1' : 'none', cursor: 'pointer', position: 'relative' as const }
    };

    switch (component.type) {
      case 'button':
        return <button {...commonProps}>{component.props.label}</button>;
      case 'input':
        return <input {...commonProps} placeholder={component.props.placeholder} readOnly />;
      case 'text':
        return <div {...commonProps}>{component.props.content}</div>;
      case 'card':
        return <div {...commonProps}>{component.props.children || <span className="text-zinc-600 text-xs">Container</span>}</div>;
      case 'image':
        return <img {...commonProps} src={component.props.src} />;
      case 'switch':
         return (
             <div {...commonProps}>
                 <div className={`w-8 h-4 rounded-full relative transition-colors ${component.props.checked ? 'bg-indigo-600' : 'bg-zinc-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${component.props.checked ? 'left-4.5' : 'left-0.5'}`}></div>
                 </div>
                 <span className="text-xs text-zinc-400">Label</span>
             </div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
       {/* Toast */}
       <div className={`absolute top-16 right-4 z-50 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
          <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
             <span className="material-symbols-rounded text-lg">check_circle</span>
          </div>
          <div>
             <h4 className="text-xs font-bold text-white">Export Successful</h4>
             <p className="text-[10px] text-zinc-400">UI schema saved to local clipboard.</p>
          </div>
       </div>

      {/* Toolbar */}
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-indigo-500">grid_view</span>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Visual Studio</span>
           </div>
           <div className="h-4 w-px bg-zinc-800"></div>
           
           <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              {(['phone', 'tablet', 'desktop'] as DeviceCategory[]).map(cat => (
                 <button 
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedDevice(DEVICES.find(d => d.category === cat) || DEVICES[0]);
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${selectedCategory === cat ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
                 >
                    <span className="material-symbols-rounded text-sm">
                      {cat === 'phone' ? 'smartphone' : cat === 'tablet' ? 'tablet' : 'desktop_windows'}
                    </span>
                    {cat.toUpperCase()}
                 </button>
              ))}
           </div>
           
           <div className="h-4 w-px bg-zinc-800"></div>

           <div className="flex items-center gap-2">
              {filteredDevices.map(device => (
                 <button
                   key={device.id}
                   onClick={() => setSelectedDevice(device)}
                   className={`size-8 rounded flex items-center justify-center transition-all ${selectedDevice.id === device.id ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                   title={device.name}
                 >
                    <span className="material-symbols-rounded text-lg">{device.icon}</span>
                 </button>
              ))}
           </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
             <button onClick={() => setZoom(Math.max(25, zoom - 10))} className="size-6 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"><span className="material-symbols-rounded text-sm">remove</span></button>
             <span className="text-[9px] font-mono text-zinc-400 w-8 text-center">{zoom}%</span>
             <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="size-6 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"><span className="material-symbols-rounded text-sm">add</span></button>
          </div>
          <button onClick={handleExport} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20">
            Export UI
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette */}
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
           <div className="h-9 px-4 flex items-center border-b border-zinc-800/50">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Components</span>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-4">
              <div>
                 <h4 className="px-2 mb-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Base Elements</h4>
                 <div className="grid grid-cols-2 gap-2">
                    {Object.keys(DEFAULT_COMPONENTS).map((type) => (
                       <button 
                         key={type} 
                         onClick={() => addComponent(type as ComponentType)}
                         className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all group"
                       >
                          <span className="material-symbols-rounded text-xl text-zinc-500 group-hover:text-indigo-400">
                             {type === 'button' ? 'smart_button' : type === 'input' ? 'text_fields' : type === 'card' ? 'web_asset' : type === 'text' ? 'title' : type === 'image' ? 'image' : 'toggle_on'}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase">{type}</span>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-zinc-950 relative overflow-auto flex items-center justify-center p-12 dot-pattern" onClick={() => setSelectedComponentId(null)}>
           <style>{`.dot-pattern { background-image: radial-gradient(#27272a 1px, transparent 1px); background-size: 24px 24px; }`}</style>

           {/* Canvas Tools */}
           <div className="absolute top-6 left-6 flex flex-col gap-2 bg-zinc-900/80 backdrop-blur p-1 rounded-lg border border-zinc-800 shadow-xl z-20">
              <button onClick={() => setActiveTool('select')} className={`size-8 flex items-center justify-center rounded transition-all ${activeTool === 'select' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}><span className="material-symbols-rounded text-lg">near_me</span></button>
              <button onClick={() => setActiveTool('move')} className={`size-8 flex items-center justify-center rounded transition-all ${activeTool === 'move' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}><span className="material-symbols-rounded text-lg">open_with</span></button>
           </div>

           {/* Device Frame */}
           <div 
             className="relative bg-black rounded-[40px] border-[8px] border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all overflow-hidden flex flex-col"
             style={{ 
               width: selectedDevice.width, 
               height: selectedDevice.height,
               transform: `scale(${zoom / 100})`,
               borderRadius: selectedCategory === 'desktop' ? '12px' : '40px',
               borderWidth: selectedCategory === 'desktop' ? '12px' : '8px'
             }}
             onClick={(e) => e.stopPropagation()} // Prevent deselecting when clicking device frame
           >
              {/* Device Header */}
              {selectedCategory !== 'desktop' ? (
                  <div className={`h-10 flex items-center justify-between px-8 shrink-0 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>9:41</span>
                      <div className={`flex gap-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          <span className="material-symbols-rounded text-[14px]">signal_cellular_alt</span>
                          <span className="material-symbols-rounded text-[14px]">wifi</span>
                          <span className="material-symbols-rounded text-[14px]">battery_full</span>
                      </div>
                  </div>
              ) : (
                  <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-2">
                       <div className="flex gap-1.5"><div className="size-2.5 rounded-full bg-red-500/50"></div><div className="size-2.5 rounded-full bg-amber-500/50"></div><div className="size-2.5 rounded-full bg-emerald-500/50"></div></div>
                       <div className="flex-1 flex justify-center"><div className="px-4 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[9px] text-zinc-500 font-mono">themag.dev/preview</div></div>
                  </div>
              )}

              {/* Rendered Components Layer */}
              <div className={`flex-1 relative overflow-auto p-4 flex flex-col gap-4 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
                 {components.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 pointer-events-none">
                       <span className="material-symbols-rounded text-4xl mb-2 opacity-50">touch_app</span>
                       <p className="text-xs font-medium">Add components from the sidebar</p>
                    </div>
                 )}
                 {components.map(renderComponent)}
              </div>
           </div>
        </main>

        {/* Property Inspector */}
        <aside className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col shrink-0">
           <div className="h-9 px-4 flex items-center border-b border-zinc-800/50">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Inspector</span>
           </div>
           {selectedComponent ? (
               <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                     <div>
                        <h3 className="text-xs font-bold text-white uppercase">{selectedComponent.type}</h3>
                        <p className="text-[9px] text-zinc-500 font-mono">{selectedComponent.id}</p>
                     </div>
                     <button onClick={() => removeComponent(selectedComponent.id)} className="text-zinc-500 hover:text-red-400">
                        <span className="material-symbols-rounded text-sm">delete</span>
                     </button>
                  </div>

                  {/* Props Editor */}
                  <div className="space-y-4">
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Properties</span>
                     
                     {selectedComponent.type === 'button' && (
                        <div className="space-y-2">
                           <label className="text-[9px] text-zinc-400">Label</label>
                           <input 
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white"
                              value={selectedComponent.props.label}
                              onChange={e => updateComponent(selectedComponent.id, { props: { label: e.target.value } })}
                           />
                        </div>
                     )}
                     
                     {selectedComponent.type === 'text' && (
                        <div className="space-y-2">
                           <label className="text-[9px] text-zinc-400">Content</label>
                           <input 
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white"
                              value={selectedComponent.props.content}
                              onChange={e => updateComponent(selectedComponent.id, { props: { content: e.target.value } })}
                           />
                        </div>
                     )}

                     {selectedComponent.type === 'image' && (
                        <div className="space-y-2">
                           <label className="text-[9px] text-zinc-400">Source URL</label>
                           <input 
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white"
                              value={selectedComponent.props.src}
                              onChange={e => updateComponent(selectedComponent.id, { props: { src: e.target.value } })}
                           />
                        </div>
                     )}

                     {selectedComponent.type === 'input' && (
                        <div className="space-y-2">
                           <label className="text-[9px] text-zinc-400">Placeholder</label>
                           <input 
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white"
                              value={selectedComponent.props.placeholder}
                              onChange={e => updateComponent(selectedComponent.id, { props: { placeholder: e.target.value } })}
                           />
                        </div>
                     )}
                  </div>

                  {/* Style Editor */}
                  <div className="space-y-4 pt-4 border-t border-zinc-800">
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Appearance</span>
                     
                     <div className="space-y-2">
                        <label className="text-[9px] text-zinc-400">Background Color</label>
                        <div className="flex gap-2">
                           <input 
                              type="color" 
                              value={selectedComponent.style.backgroundColor as string}
                              onChange={e => updateComponent(selectedComponent.id, { style: { backgroundColor: e.target.value } })}
                              className="h-8 w-8 rounded cursor-pointer bg-transparent border-none"
                           />
                           <input 
                              type="text"
                              value={selectedComponent.style.backgroundColor as string}
                              onChange={e => updateComponent(selectedComponent.id, { style: { backgroundColor: e.target.value } })}
                              className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 font-mono uppercase"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] text-zinc-400">Text Color</label>
                        <div className="flex gap-2">
                           <input 
                              type="color" 
                              value={selectedComponent.style.color as string}
                              onChange={e => updateComponent(selectedComponent.id, { style: { color: e.target.value } })}
                              className="h-8 w-8 rounded cursor-pointer bg-transparent border-none"
                           />
                           <input 
                              type="text"
                              value={selectedComponent.style.color as string}
                              onChange={e => updateComponent(selectedComponent.id, { style: { color: e.target.value } })}
                              className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 font-mono uppercase"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1">
                             <label className="text-[9px] text-zinc-400">Width</label>
                             <input 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white"
                                value={selectedComponent.style.width}
                                onChange={e => updateComponent(selectedComponent.id, { style: { width: e.target.value } })}
                             />
                         </div>
                         <div className="space-y-1">
                             <label className="text-[9px] text-zinc-400">Height</label>
                             <input 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white"
                                value={selectedComponent.style.height || 'auto'}
                                onChange={e => updateComponent(selectedComponent.id, { style: { height: e.target.value } })}
                             />
                         </div>
                     </div>
                  </div>
               </div>
           ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <span className="material-symbols-rounded text-zinc-700 text-3xl mb-2">touch_app</span>
                  <p className="text-xs text-zinc-500">Select a component on the canvas to edit its properties.</p>
               </div>
           )}
        </aside>
      </div>
    </div>
  );
};

export default UIUXDesign;