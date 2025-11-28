import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Terminal, Cpu, Palette, 
  ChevronLeft, Globe, 
  Smartphone, Activity, Move3d, Waves,
  Upload, Sparkles, Network, Grid,
  Image as ImageIcon, Film
} from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

type ViewState = 'main' | 'appearance' | 'branding' | 'language';

const DeveloperPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('main');
  
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { 
    settings, 
    updateSetting, 
    updateButtonConfig, 
    updateCardConfig, 
    updateModalConfig,
    updateContainerConfig,
    updateProceduralConfig,
    updateMedia
  } = useTheme();

  // Toggle visibility with Ctrl + D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dragging logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const startDrag = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  };

  const handleFileUpload = (type: 'image' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateMedia(type, url);
    }
  };

  // Option Constants for readable labels
  const backgroundTypeOptions = [
    { value: 'procedural', label: 'Live Animation' },
    { value: 'solid', label: 'Solid Color' },
    { value: 'image', label: 'Static Image' },
    { value: 'video', label: 'Video Loop' },
  ];

  const hoverEffectOptions = [
    { value: 'none', label: 'No Effect' },
    { value: 'scale', label: 'Scale Up' },
    { value: 'lift', label: 'Lift Up' },
    { value: 'glow', label: 'Soft Glow' },
  ];

  const roundedOptions = [
    { value: 'none', label: 'Square' },
    { value: 'sm', label: 'Small Radius' },
    { value: 'md', label: 'Medium Radius' },
    { value: 'lg', label: 'Large Radius' },
    { value: 'full', label: 'Pill Shape' },
  ];

  const overflowOptions = [
    { value: 'visible', label: 'Always Visible' },
    { value: 'hidden', label: 'Clip Content' },
    { value: 'auto', label: 'Auto Scroll' },
    { value: 'scroll', label: 'Always Scroll' },
  ];

  const fontFamilyOptions = [
    { value: 'sans', label: 'Modern Sans' },
    { value: 'serif', label: 'Classic Serif' },
    { value: 'mono', label: 'Tech Mono' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'slab', label: 'Slab Serif' },
  ];

  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className="fixed z-50 w-80 h-[80vh] flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5 font-sans"
    >
      {/* Header */}
      <div
        onMouseDown={startDrag}
        className="flex-none flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 cursor-grab active:cursor-grabbing select-none z-10"
      >
        <div className="flex items-center space-x-2 text-indigo-400">
          <Terminal size={14} />
          <span className="text-xs font-semibold tracking-wider uppercase">DevTools v2.2</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content Container */}
      <div className="flex-1 relative w-full overflow-hidden bg-slate-900/50">
        
        {/* === Main View === */}
        <div 
          className={`absolute inset-0 w-full h-full flex flex-col p-4 space-y-5 transition-transform duration-300 ease-in-out ${
            currentView === 'main' ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/50 p-2 rounded border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Status</span>
                  <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs text-slate-300 font-medium">Active</span>
                  </div>
              </div>
              <div className="bg-slate-800/50 p-2 rounded border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Mode</span>
                  <span className="text-xs text-slate-300 font-medium">Debug</span>
              </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1"><Cpu size={12}/> Render Time</span>
              <span className="font-mono text-emerald-400">0.8ms</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[12%] rounded-full" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-end space-y-1 pt-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Settings</h3>
            
            <NavButton 
              icon={<Palette size={16} />} 
              label="Appearance" 
              onClick={() => setCurrentView('appearance')} 
            />
            <NavButton 
              icon={<Smartphone size={16} />} 
              label="App Branding" 
              onClick={() => setCurrentView('branding')} 
            />
            <NavButton 
              icon={<Globe size={16} />} 
              label="Language" 
              onClick={() => setCurrentView('language')} 
            />
          </div>
        </div>

        {/* === Appearance View === */}
        <SubPage 
          id="appearance" 
          activeView={currentView} 
          title="Appearance" 
          onBack={() => setCurrentView('main')}
        >
          <div className="space-y-6 pb-8">
            
            {/* 1. Typography */}
            <Section title="1. Typography">
              <SelectControl 
                label="Font Family"
                value={settings.fontFamily}
                options={fontFamilyOptions}
                onChange={(v) => updateSetting('fontFamily', v as any)}
              />
              <RangeControl 
                label="Size Scale" 
                value={settings.fontScale} 
                min={0.8} max={1.5} step={0.05}
                onChange={(v) => updateSetting('fontScale', v)} 
                unit="x"
              />
              <RangeControl 
                label="Line Height" 
                value={settings.lineHeight} 
                min={1} max={2.5} step={0.1}
                onChange={(v) => updateSetting('lineHeight', v)} 
              />
              <RangeControl 
                label="Letter Spacing" 
                value={settings.letterSpacing} 
                min={-0.05} max={0.1} step={0.01}
                onChange={(v) => updateSetting('letterSpacing', v)} 
                unit="em"
              />
            </Section>

            {/* 2. Color Palette */}
            <Section title="2. Color Palette">
              <div className="space-y-2">
                <ColorPicker label="Primary" value={settings.primaryColor} onChange={(c) => updateSetting('primaryColor', c)} />
                <ColorPicker label="Secondary" value={settings.secondaryColor} onChange={(c) => updateSetting('secondaryColor', c)} />
                <ColorPicker label="UI Shadow" value={settings.shadowColor} onChange={(c) => updateSetting('shadowColor', c)} />
              </div>
              
              <div className="pt-2 border-t border-white/5 space-y-2">
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase">Text & Effects</h4>
                 <div className="grid grid-cols-2 gap-2">
                    <ColorPicker label="Normal" value={settings.textColor} onChange={(c) => updateSetting('textColor', c)} compact />
                    <ColorPicker label="Muted" value={settings.mutedColor} onChange={(c) => updateSetting('mutedColor', c)} compact />
                    <ColorPicker label="Highlight" value={settings.highlightColor} onChange={(c) => updateSetting('highlightColor', c)} compact />
                    <ColorPicker label="Shadow" value={settings.textShadowColor} onChange={(c) => updateSetting('textShadowColor', c)} compact />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <ColorPicker label="Success" value={settings.successColor} onChange={(c) => updateSetting('successColor', c)} compact />
                <ColorPicker label="Warning" value={settings.warningColor} onChange={(c) => updateSetting('warningColor', c)} compact />
                <ColorPicker label="Info" value={settings.infoColor} onChange={(c) => updateSetting('infoColor', c)} compact />
                <ColorPicker label="Error" value={settings.errorColor} onChange={(c) => updateSetting('errorColor', c)} compact />
              </div>
            </Section>

            {/* 3. Background System */}
            <Section title="3. Background System">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {backgroundTypeOptions.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateSetting('backgroundType', type.value as any)}
                      className={`px-3 py-2 text-xs rounded border transition-all ${
                        settings.backgroundType === type.value 
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200' 
                          : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {settings.backgroundType === 'procedural' && (
                  <div className="bg-slate-900/50 rounded-lg p-2 border border-white/5">
                    <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-1">Active Effect</h4>
                    <div className="grid grid-cols-1 gap-1 mb-3">
                      {[
                        { id: 'aether', label: 'Aether Drift', icon: Activity },
                        { id: 'waves', label: 'Aurora Waves', icon: Waves },
                        { id: 'cosmos', label: 'Deep Cosmos', icon: Move3d },
                        { id: 'net', label: 'Neural Net', icon: Network },
                        { id: 'grid', label: 'Cyber Grid', icon: Grid }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => updateSetting('proceduralSet', mode.id as any)}
                          className={`flex items-center gap-3 px-3 py-2 text-xs rounded transition-all ${
                            settings.proceduralSet === mode.id
                              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          <mode.icon size={14} className={settings.proceduralSet === mode.id ? 'text-indigo-400' : 'text-slate-600'} />
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    {/* Active Effect Settings - 4 Settings in 2 Columns */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                        <ColorPicker 
                           label="Base Color" 
                           value={settings[`${settings.proceduralSet}Config`].bgColor} 
                           onChange={(c) => updateProceduralConfig(settings.proceduralSet, 'bgColor', c)} 
                           compact 
                        />
                         <ColorPicker 
                           label="Element" 
                           value={settings[`${settings.proceduralSet}Config`].elementColor} 
                           onChange={(c) => updateProceduralConfig(settings.proceduralSet, 'elementColor', c)} 
                           compact 
                        />
                        <RangeControl 
                           label="Speed" 
                           value={settings[`${settings.proceduralSet}Config`].speed}
                           min={0.1} max={5} step={0.1}
                           onChange={(v) => updateProceduralConfig(settings.proceduralSet, 'speed', v)}
                           unit="x"
                        />
                         <RangeControl 
                           label="Intensity" 
                           value={settings[`${settings.proceduralSet}Config`].intensity}
                           min={10} max={500} step={10}
                           onChange={(v) => updateProceduralConfig(settings.proceduralSet, 'intensity', v)}
                           unit=""
                        />
                    </div>
                  </div>
                )}

                {settings.backgroundType === 'solid' && (
                  <ColorPicker label="Solid Color" value={settings.backgroundColor} onChange={(c) => updateSetting('backgroundColor', c)} />
                )}

                {settings.backgroundType === 'image' && (
                  <div className="space-y-2 bg-slate-900/50 p-2 rounded border border-white/5">
                     <div className="text-[10px] text-slate-500 uppercase">Image Source</div>
                     <input 
                       type="text" 
                       value={settings.backgroundImage}
                       onChange={(e) => updateMedia('image', e.target.value)}
                       placeholder="https://..."
                       className="w-full bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded px-2 py-1 outline-none focus:border-indigo-500"
                     />
                     <div className="relative group cursor-pointer border border-dashed border-slate-700 rounded p-2 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload('image', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <ImageIcon size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-400">Upload Image</span>
                     </div>
                  </div>
                )}

                {settings.backgroundType === 'video' && (
                   <div className="space-y-2 bg-slate-900/50 p-2 rounded border border-white/5">
                      <div className="text-[10px] text-slate-500 uppercase">Video Source</div>
                      <input 
                        type="text" 
                        value={settings.backgroundVideo}
                        onChange={(e) => updateMedia('video', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded px-2 py-1 outline-none focus:border-indigo-500"
                      />
                      <div className="relative group cursor-pointer border border-dashed border-slate-700 rounded p-2 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                        <input type="file" accept="video/*" onChange={(e) => handleFileUpload('video', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Film size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-400">Upload Video</span>
                     </div>
                   </div>
                )}
              </div>
            </Section>

            {/* 4. Button Styling */}
            <Section title="4. Button Styling">
              <div className="space-y-4">
                {/* Primary Button */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase">Primary Button</h4>
                  <div className="bg-slate-900/40 p-3 rounded border border-white/5 space-y-2">
                     <ToggleControl 
                        label="Gradient Background" 
                        checked={settings.buttonPrimary.isGradient} 
                        onChange={(v) => updateButtonConfig('primary', 'isGradient', v)} 
                     />
                     <ToggleControl 
                        label="Drop Shadow" 
                        checked={settings.buttonPrimary.hasShadow} 
                        onChange={(v) => updateButtonConfig('primary', 'hasShadow', v)} 
                     />
                     <SelectControl 
                        label="Hover Effect"
                        value={settings.buttonPrimary.hoverEffect}
                        options={hoverEffectOptions}
                        onChange={(v) => updateButtonConfig('primary', 'hoverEffect', v)}
                     />
                     <SelectControl 
                        label="Rounded"
                        value={settings.buttonPrimary.rounded}
                        options={roundedOptions}
                        onChange={(v) => updateButtonConfig('primary', 'rounded', v)}
                     />
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase">Secondary Button</h4>
                  <div className="bg-slate-900/40 p-3 rounded border border-white/5 space-y-2">
                     <ToggleControl 
                        label="Gradient Background" 
                        checked={settings.buttonSecondary.isGradient} 
                        onChange={(v) => updateButtonConfig('secondary', 'isGradient', v)} 
                     />
                     <ToggleControl 
                        label="Drop Shadow" 
                        checked={settings.buttonSecondary.hasShadow} 
                        onChange={(v) => updateButtonConfig('secondary', 'hasShadow', v)} 
                     />
                     <SelectControl 
                        label="Hover Effect"
                        value={settings.buttonSecondary.hoverEffect}
                        options={hoverEffectOptions}
                        onChange={(v) => updateButtonConfig('secondary', 'hoverEffect', v)}
                     />
                     <SelectControl 
                        label="Rounded"
                        value={settings.buttonSecondary.rounded}
                        options={roundedOptions}
                        onChange={(v) => updateButtonConfig('secondary', 'rounded', v)}
                     />
                  </div>
                </div>
              </div>
            </Section>

            {/* 5. Card Styling */}
            <Section title="5. Card Styling">
              <div className="space-y-4">
                 <p className="text-[10px] text-slate-500 mb-2">Controls for the feature grid items.</p>
                 
                 {/* Main Dimensions Grid */}
                 <div className="grid grid-cols-2 gap-3">
                    <RangeControl 
                        label="BG Opacity" 
                        value={settings.cardConfig.bgOpacity} 
                        min={0} max={1} step={0.05}
                        onChange={(v) => updateCardConfig('bgOpacity', v)} 
                    />
                    <RangeControl 
                        label="Blur" 
                        value={settings.cardConfig.blur} 
                        min={0} max={20} 
                        onChange={(v) => updateCardConfig('blur', v)} 
                        unit="px"
                    />
                    <RangeControl 
                        label="Rounded" 
                        value={settings.cardConfig.rounded} 
                        min={0} max={32} 
                        onChange={(v) => updateCardConfig('rounded', v)} 
                        unit="px"
                    />
                    <RangeControl 
                        label="Padding" 
                        value={settings.cardConfig.padding} 
                        min={0} max={48} 
                        onChange={(v) => updateCardConfig('padding', v)} 
                        unit="px"
                    />
                 </div>
                 
                 {/* Background & Effects Group */}
                 <div className="pt-3 border-t border-white/5">
                   <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Background & Effects</h5>
                   
                   <div className="grid grid-cols-2 gap-2 mb-3">
                      <ColorPicker label="Start" value={settings.cardConfig.gradientStart} onChange={(c) => updateCardConfig('gradientStart', c)} compact />
                      <ColorPicker label="End" value={settings.cardConfig.gradientEnd} onChange={(c) => updateCardConfig('gradientEnd', c)} compact />
                   </div>
                   
                   <RangeControl 
                    label="Direction" 
                    value={parseInt(settings.cardConfig.gradientDirection)} 
                    min={0} max={360} 
                    onChange={(v) => updateCardConfig('gradientDirection', v.toString())} 
                    unit="deg"
                  />
                 </div>
                 
                 {/* Border & Shadow Toggles */}
                 <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                      <ToggleControl 
                          label="Border" 
                          checked={settings.cardConfig.hasBorder} 
                          onChange={(v) => updateCardConfig('hasBorder', v)} 
                      />
                      {settings.cardConfig.hasBorder && (
                        <div className="mt-1">
                          <ColorPicker 
                            label="Color" 
                            value={settings.borderColor} 
                            onChange={(c) => updateSetting('borderColor', c)} 
                            compact 
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <ToggleControl 
                          label="Shadow" 
                          checked={settings.cardConfig.hasShadow} 
                          onChange={(v) => updateCardConfig('hasShadow', v)} 
                      />
                      {settings.cardConfig.hasShadow && (
                         <div className="mt-1">
                           <ColorPicker 
                             label="Color" 
                             value={settings.shadowColor} 
                             onChange={(c) => updateSetting('shadowColor', c)} 
                             compact 
                           />
                         </div>
                      )}
                    </div>
                 </div>
              </div>
            </Section>

            {/* 6. Modal Popups */}
            <Section title="6. Modal Popups">
              <div className="space-y-4">
                 <p className="text-[10px] text-slate-500 mb-2">Controls for modals, dropdowns and mobile sidebar.</p>
                 
                 {/* Main Dimensions Grid */}
                 <div className="grid grid-cols-2 gap-3">
                    <RangeControl 
                        label="BG Opacity" 
                        value={settings.modalConfig.bgOpacity} 
                        min={0} max={1} step={0.05}
                        onChange={(v) => updateModalConfig('bgOpacity', v)} 
                    />
                    <RangeControl 
                        label="Blur" 
                        value={settings.modalConfig.blur} 
                        min={0} max={40} 
                        onChange={(v) => updateModalConfig('blur', v)} 
                        unit="px"
                    />
                    <RangeControl 
                        label="Rounded" 
                        value={settings.modalConfig.rounded} 
                        min={0} max={32} 
                        onChange={(v) => updateModalConfig('rounded', v)} 
                        unit="px"
                    />
                    <RangeControl 
                        label="Padding" 
                        value={settings.modalConfig.padding} 
                        min={0} max={48} 
                        onChange={(v) => updateModalConfig('padding', v)} 
                        unit="px"
                    />
                 </div>
                 
                 {/* Background & Effects Group */}
                 <div className="pt-3 border-t border-white/5">
                   <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Background & Effects</h5>
                   
                   <div className="grid grid-cols-2 gap-2 mb-3">
                      <ColorPicker label="Start" value={settings.modalConfig.gradientStart} onChange={(c) => updateModalConfig('gradientStart', c)} compact />
                      <ColorPicker label="End" value={settings.modalConfig.gradientEnd} onChange={(c) => updateModalConfig('gradientEnd', c)} compact />
                   </div>
                   
                   <RangeControl 
                    label="Direction" 
                    value={parseInt(settings.modalConfig.gradientDirection)} 
                    min={0} max={360} 
                    onChange={(v) => updateModalConfig('gradientDirection', v.toString())} 
                    unit="deg"
                  />
                 </div>
                 
                 {/* Border & Shadow Toggles */}
                 <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                      <ToggleControl 
                          label="Border" 
                          checked={settings.modalConfig.hasBorder} 
                          onChange={(v) => updateModalConfig('hasBorder', v)} 
                      />
                      {settings.modalConfig.hasBorder && (
                        <div className="mt-1">
                          <ColorPicker 
                            label="Color" 
                            value={settings.borderColor} 
                            onChange={(c) => updateSetting('borderColor', c)} 
                            compact 
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <ToggleControl 
                          label="Shadow" 
                          checked={settings.modalConfig.hasShadow} 
                          onChange={(v) => updateModalConfig('hasShadow', v)} 
                      />
                      {settings.modalConfig.hasShadow && (
                         <div className="mt-1">
                           <ColorPicker 
                             label="Color" 
                             value={settings.shadowColor} 
                             onChange={(c) => updateSetting('shadowColor', c)} 
                             compact 
                           />
                         </div>
                      )}
                    </div>
                 </div>
              </div>
            </Section>

            {/* 7. App Container */}
            <Section title="7. App Container">
              <div className="space-y-4">
                 <p className="text-[10px] text-slate-500 mb-2">Controls for the main content wrapper.</p>
                 
                 {/* Dimensions Group */}
                 <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                       <RangeControl 
                          label="Width" 
                          value={settings.containerConfig.width} 
                          min={20} max={100} step={2}
                          onChange={(v) => updateContainerConfig('width', v)} 
                          unit="vw"
                        />
                        <RangeControl 
                          label="Max Width" 
                          value={settings.containerConfig.maxWidth} 
                          min={400} max={2000} step={50}
                          onChange={(v) => updateContainerConfig('maxWidth', v)} 
                          unit="px"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <RangeControl 
                        label="Height" 
                        value={settings.containerConfig.height} 
                        min={0} max={100} step={2}
                        onChange={(v) => updateContainerConfig('height', v)} 
                        unit={settings.containerConfig.height === 0 ? ' (Auto)' : 'vh'}
                      />
                      <RangeControl 
                        label="Radius" 
                        value={settings.containerConfig.radius} 
                        min={0} max={64} 
                        onChange={(v) => updateContainerConfig('radius', v)} 
                        unit="px"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <RangeControl 
                            label="Padding" 
                            value={settings.containerConfig.padding} 
                            min={0} max={100} 
                            onChange={(v) => updateContainerConfig('padding', v)} 
                            unit="px"
                         />
                         <RangeControl 
                            label="Margin" 
                            value={settings.containerConfig.margin} 
                            min={0} max={100} 
                            onChange={(v) => updateContainerConfig('margin', v)} 
                            unit="px"
                         />
                    </div>
                    
                    <ToggleControl 
                        label="Fill Smaller (Mobile)" 
                        checked={settings.containerConfig.fillSmaller} 
                        onChange={(v) => updateContainerConfig('fillSmaller', v)} 
                    />
                 </div>
                 
                 {/* Background & Effects Group */}
                 <div className="pt-3 border-t border-white/5">
                   <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Background & Effects</h5>
                   
                   <div className="grid grid-cols-2 gap-2 mb-3">
                      <ColorPicker label="Start" value={settings.containerConfig.gradientStart} onChange={(c) => updateContainerConfig('gradientStart', c)} compact />
                      <ColorPicker label="End" value={settings.containerConfig.gradientEnd} onChange={(c) => updateContainerConfig('gradientEnd', c)} compact />
                   </div>
                   
                   {/* Side by Side: Direction & Blur */}
                   <div className="grid grid-cols-2 gap-3">
                      <RangeControl 
                        label="Direction" 
                        value={parseInt(settings.containerConfig.gradientDirection)} 
                        min={0} max={360} 
                        onChange={(v) => updateContainerConfig('gradientDirection', v.toString())} 
                        unit="deg"
                      />
                      <RangeControl 
                        label="Backdrop Blur" 
                        value={settings.containerConfig.backdropBlur} 
                        min={0} max={40} 
                        onChange={(v) => updateContainerConfig('backdropBlur', v)} 
                        unit="px"
                      />
                   </div>
                 </div>

                 {/* Layout & Overflow Group */}
                 <div className="pt-3 border-t border-white/5 space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase">Layout Behavior</h5>
                    
                    <SelectControl 
                      label="Overflow Y"
                      value={settings.containerConfig.overflow}
                      options={overflowOptions}
                      onChange={(v) => updateContainerConfig('overflow', v as any)}
                    />
                     
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="flex flex-col gap-2">
                           <ToggleControl 
                            label="Border" 
                            checked={settings.containerConfig.hasBorder} 
                            onChange={(v) => updateContainerConfig('hasBorder', v)} 
                          />
                           {settings.containerConfig.hasBorder && (
                            <div className="mt-1">
                              <ColorPicker 
                                label="Color" 
                                value={settings.borderColor} 
                                onChange={(c) => updateSetting('borderColor', c)} 
                                compact 
                              />
                            </div>
                          )}
                        </div>
                       
                        <div className="flex flex-col gap-2">
                          <ToggleControl 
                            label="Shadow" 
                            checked={settings.containerConfig.hasShadow} 
                            onChange={(v) => updateContainerConfig('hasShadow', v)} 
                          />
                          {settings.containerConfig.hasShadow && (
                             <div className="mt-1">
                               <ColorPicker 
                                 label="Color" 
                                 value={settings.shadowColor} 
                                 onChange={(c) => updateSetting('shadowColor', c)} 
                                 compact 
                               />
                             </div>
                          )}
                        </div>
                    </div>
                 </div>
               </div>
            </Section>

          </div>
        </SubPage>

        {/* === Branding View === */}
        <SubPage 
          id="branding" 
          activeView={currentView} 
          title="App Branding" 
          onBack={() => setCurrentView('main')}
        >
          <div className="space-y-6">
            <Section title="Logos & Icons">
              <MockFileUpload label="App Icon (ICO)" />
              <MockFileUpload label="Vector Logo (SVG)" />
              <MockFileUpload label="Favicon" />
            </Section>
            
            <Section title="Splash Screen">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Type</span>
                  <div className="flex bg-slate-800 rounded p-0.5">
                    <button className="px-2 py-0.5 text-[10px] bg-slate-700 rounded text-white shadow-sm">Image</button>
                    <button className="px-2 py-0.5 text-[10px] text-slate-500">Video</button>
                  </div>
               </div>
               <MockFileUpload label="Splash Asset" />
            </Section>
          </div>
        </SubPage>

         {/* === Language View === */}
         <SubPage 
          id="language" 
          activeView={currentView} 
          title="Language" 
          onBack={() => setCurrentView('main')}
        >
          <div className="space-y-6">
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex gap-3 items-start">
              <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-indigo-200">AI Assistant</h4>
                <p className="text-[10px] text-indigo-300/70 mt-1 leading-relaxed">
                  Generate new language files automatically using AI. Just select your target locale.
                </p>
                <button className="mt-2 text-[10px] px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors">
                  Create New Locale
                </button>
              </div>
            </div>

            <Section title="Available Languages">
              <div className="space-y-1">
                {[
                  { code: 'en-US', name: 'English (US)', active: true },
                  { code: 'es-ES', name: 'Spanish', active: false },
                  { code: 'fr-FR', name: 'French', active: false },
                  { code: 'de-DE', name: 'German', active: false },
                  { code: 'ja-JP', name: 'Japanese', active: false },
                ].map(lang => (
                   <div key={lang.code} className="flex items-center justify-between p-2 hover:bg-white/5 rounded group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500">{lang.code}</span>
                        <span className={`text-sm ${lang.code === settings.language ? 'text-white font-medium' : 'text-slate-300'}`}>{lang.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lang.code === settings.language && <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">Default</span>}
                        <input 
                          type="checkbox" 
                          checked={lang.active || lang.code === settings.language} 
                          readOnly
                          className="accent-indigo-500"
                        />
                      </div>
                   </div>
                ))}
              </div>
            </Section>
          </div>
        </SubPage>

      </div>

      {/* Footer / Debug Info */}
      <div className="flex-none pt-2 pb-2 px-4 border-t border-white/5 bg-slate-900/80">
          <div className="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>POS: {Math.round(position.x)}, {Math.round(position.y)}</span>
              <span>VER: 2.2.0-beta</span>
          </div>
      </div>
    </div>
  );
};

// --- Sub-components for Panel Layout ---

const NavButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
  >
    <div className="p-1.5 rounded-md bg-slate-800 group-hover:bg-slate-700 text-slate-300 group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className="text-sm font-medium">{label}</span>
    <ChevronLeft className="w-4 h-4 ml-auto rotate-180 opacity-0 group-hover:opacity-50 transition-opacity" />
  </button>
);

const SubPage: React.FC<{ 
  id: string, 
  activeView: string, 
  title: string, 
  onBack: () => void, 
  children: React.ReactNode 
}> = ({ id, activeView, title, onBack, children }) => {
  const isActive = activeView === id;
  return (
    <div 
      className={`absolute inset-0 w-full h-full flex flex-col bg-slate-900 transition-transform duration-300 ease-in-out ${
        isActive ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <button onClick={onBack} className="p-1 -ml-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
    <div className="bg-slate-800/20 border border-white/5 rounded-lg p-3 space-y-3">
      {children}
    </div>
  </div>
);

const RangeControl: React.FC<{ 
  label: string, 
  value: number, 
  min: number, 
  max: number, 
  step?: number,
  onChange: (val: number) => void, 
  unit?: string 
}> = ({ label, value, min, max, step = 1, onChange, unit }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-slate-500">{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 hover:[&::-webkit-slider-thumb]:bg-indigo-400"
    />
  </div>
);

const ToggleControl: React.FC<{ label: string, checked: boolean, onChange: (val: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-slate-300">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`w-8 h-4 rounded-full transition-colors relative ${checked ? 'bg-indigo-500' : 'bg-slate-700'}`}
    >
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${checked ? 'left-4.5 translate-x-0' : 'left-0.5'}`} style={{ left: checked ? 'calc(100% - 14px)' : '2px' }}/>
    </button>
  </div>
);

const SelectControl: React.FC<{ label: string, value: string, options: { label: string, value: string }[], onChange: (val: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-slate-300">{label}</span>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded px-2 py-1 outline-none focus:border-indigo-500 max-w-[120px]"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const ColorPicker: React.FC<{ label: string, value: string, onChange: (val: string) => void, compact?: boolean }> = ({ label, value, onChange, compact }) => (
  <div className={`flex items-center justify-between ${compact ? 'bg-slate-800/30 p-2 rounded' : ''}`}>
    <span className="text-xs text-slate-400">{label}</span>
    <div className="flex items-center gap-2">
      {!compact && <span className="text-[10px] font-mono text-slate-500 uppercase">{value}</span>}
      <div className="relative w-5 h-5 rounded overflow-hidden ring-1 ring-white/10 shrink-0 shadow-sm">
        <input 
          type="color" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
        />
      </div>
    </div>
  </div>
);

const MockFileUpload: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-between p-2 border border-dashed border-slate-700 rounded hover:border-slate-500 transition-colors cursor-pointer group">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-slate-800 rounded text-slate-500 group-hover:text-slate-300">
        <Upload size={14} />
      </div>
      <span className="text-xs text-slate-400 group-hover:text-slate-200">{label}</span>
    </div>
    <span className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">Select</span>
  </div>
);

export default DeveloperPanel;