"use client";

import React, { useState, useEffect, Suspense } from 'react';
import AtmosphericBackground from '@/components/AtmosphericBackground';
import { useTheme, ThemeProvider } from '@/app/context/ThemeContext';

// Lazy load Developer Tools
const DeveloperPanel = React.lazy(() => import('@/components/DeveloperPanel'));

const WorkspaceLayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, hexToRgb } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Responsive Check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine Background Logic
  let rootBgStyle: React.CSSProperties = {};
  
  if (settings.backgroundType === 'solid') {
    rootBgStyle.backgroundColor = settings.backgroundColor;
  } else if (settings.backgroundType === 'procedural') {
    if (settings.proceduralSet === 'aether') rootBgStyle.backgroundColor = settings.aetherConfig.bgColor;
    if (settings.proceduralSet === 'waves') rootBgStyle.backgroundColor = settings.wavesConfig.bgColor;
    if (settings.proceduralSet === 'cosmos') rootBgStyle.backgroundColor = settings.cosmosConfig.bgColor;
    if (settings.proceduralSet === 'net') rootBgStyle.backgroundColor = settings.netConfig.bgColor;
    if (settings.proceduralSet === 'grid') rootBgStyle.backgroundColor = settings.gridConfig.bgColor;
  } else if (settings.backgroundType === 'image') {
    rootBgStyle.backgroundImage = `url(${settings.backgroundImage})`;
    rootBgStyle.backgroundSize = 'cover';
    rootBgStyle.backgroundPosition = 'center';
  }

  // Determine Font Family Stack
  const fontStack = {
    'sans': 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    'serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    'mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    'geometric': '"Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif',
    'slab': '"Rockwell", "Courier Bold", Courier, Georgia, Times, "Times New Roman", serif',
  }[settings.fontFamily];

  // Mobile Override Logic
  const shouldFillSmaller = isMobile && settings.containerConfig.fillSmaller;

  // Main App Container Style (The Glass Window)
  const containerStyle: React.CSSProperties = {
    width: shouldFillSmaller ? '100vw' : `${settings.containerConfig.width}vw`,
    maxWidth: shouldFillSmaller ? '100%' : `${settings.containerConfig.maxWidth}px`,
    // Use dynamic height from settings, or auto if set to 0. Override on mobile.
    height: shouldFillSmaller ? '100vh' : (settings.containerConfig.height > 0 ? `${settings.containerConfig.height}vh` : 'auto'),
    // If fixed height, ensure we fill it; otherwise let content dictate
    minHeight: (settings.containerConfig.height > 0 || shouldFillSmaller) ? undefined : '600px', 
    
    padding: shouldFillSmaller ? '0px' : `${settings.containerConfig.padding}px`,
    margin: shouldFillSmaller ? '0px' : `${settings.containerConfig.margin}px`,
    
    // Appearance
    borderRadius: shouldFillSmaller ? '0px' : `${settings.containerConfig.radius}px`,
    background: `linear-gradient(${settings.containerConfig.gradientDirection}deg, ${settings.containerConfig.gradientStart}, ${settings.containerConfig.gradientEnd})`,
    backdropFilter: `blur(${settings.containerConfig.backdropBlur}px)`,
    borderWidth: settings.containerConfig.hasBorder ? '1px' : '0px',
    borderColor: settings.borderColor,
    boxShadow: settings.containerConfig.hasShadow ? `0 25px 50px -12px rgba(${hexToRgb(settings.shadowColor)}, 0.5)` : 'none',
    
    // Layout
    overflowX: 'hidden',
    overflowY: settings.containerConfig.overflow,
    
    // Transition
    transition: 'all 0.3s ease-out',
  };

  return (
    <div 
      style={{
        ...rootBgStyle,
        fontFamily: fontStack,
        lineHeight: settings.lineHeight,
        letterSpacing: `${settings.letterSpacing}em`,
        color: settings.textColor,
        textShadow: `0 1px 2px ${settings.textShadowColor}`
      }}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-1000 bg-slate-900"
    >
      
      {/* 1. Background Layers */}
      <AtmosphericBackground visible={settings.backgroundType === 'procedural'} />
      
      {settings.backgroundType === 'video' && settings.backgroundVideo && (
        <video 
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={settings.backgroundVideo}
        />
      )}

      {/* 2. Texture Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-10 mix-blend-overlay"></div>

      {/* 3. Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-10"></div>

      {/* 4. Developer Tools (Lazy Loaded) */}
      <Suspense fallback={null}>
        <DeveloperPanel />
      </Suspense>

      {/* 5. Main App Container Wrapper */}
      <div 
        id="app-main-container"
        style={containerStyle}
        className="relative z-20 flex flex-col custom-scrollbar"
      >
        {children}
      </div>
      
    </div>
  );
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WorkspaceLayoutContent>
        {children}
      </WorkspaceLayoutContent>
    </ThemeProvider>
  );
}
