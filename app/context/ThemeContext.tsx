import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ButtonConfig {
  hasShadow: boolean;
  isGradient: boolean;
  hoverEffect: 'none' | 'scale' | 'lift' | 'glow';
  rounded: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export interface CardConfig {
  bgOpacity: number;
  blur: number; // px
  rounded: number; // px
  padding: number; // px
  hasBorder: boolean;
  hasShadow: boolean;
  gradientDirection: string;
  gradientStart: string;
  gradientEnd: string;
}

export interface ModalConfig {
  bgOpacity: number;
  blur: number; // px
  rounded: number; // px
  padding: number; // px
  hasBorder: boolean;
  hasShadow: boolean;
  gradientDirection: string;
  gradientStart: string;
  gradientEnd: string;
}

export interface ContainerConfig {
  width: number; // vw
  maxWidth: number; // px
  height: number; // vh, 0 = auto
  padding: number; // px
  margin: number; // px
  bgOpacity: number;
  backdropBlur: number; // px
  radius: number; // px
  hasShadow: boolean;
  hasBorder: boolean;
  fillSmaller: boolean; // Override on mobile
  gradientDirection: string;
  gradientStart: string;
  gradientEnd: string;
  overflow: 'visible' | 'hidden' | 'auto' | 'scroll';
}

export interface ProceduralConfig {
  bgColor: string;
  elementColor: string;
  speed: number;
  intensity: number; // Represents Count, Amplitude, etc.
}

interface ThemeSettings {
  // Typography
  fontScale: number; // multiplier
  fontFamily: 'sans' | 'serif' | 'mono' | 'geometric' | 'slab';
  lineHeight: number;
  letterSpacing: number; // em
  
  // Global Colors
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  infoColor: string;
  warningColor: string;
  errorColor: string;
  backgroundColor: string; // for solid mode

  // Text & Effects Colors
  textColor: string;
  mutedColor: string;
  highlightColor: string;
  textShadowColor: string; // Specific for text
  borderColor: string;     // Global border color
  shadowColor: string;     // General UI shadow

  // Background System
  backgroundType: 'procedural' | 'solid' | 'image' | 'video';
  backgroundImage: string;
  backgroundVideo: string;
  proceduralSet: 'aether' | 'waves' | 'cosmos' | 'net' | 'grid';
  
  // Procedural Specifics
  aetherConfig: ProceduralConfig;
  wavesConfig: ProceduralConfig;
  cosmosConfig: ProceduralConfig;
  netConfig: ProceduralConfig;
  gridConfig: ProceduralConfig;

  // Component Configs
  buttonPrimary: ButtonConfig;
  buttonSecondary: ButtonConfig;
  cardConfig: CardConfig;
  modalConfig: ModalConfig;
  containerConfig: ContainerConfig;
  
  // Misc
  language: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  updateButtonConfig: (type: 'primary' | 'secondary', key: keyof ButtonConfig, value: any) => void;
  updateCardConfig: <K extends keyof CardConfig>(key: K, value: CardConfig[K]) => void;
  updateModalConfig: <K extends keyof ModalConfig>(key: K, value: ModalConfig[K]) => void;
  updateContainerConfig: <K extends keyof ContainerConfig>(key: K, value: ContainerConfig[K]) => void;
  updateProceduralConfig: (set: ThemeSettings['proceduralSet'], key: keyof ProceduralConfig, value: any) => void;
  updateMedia: (type: 'image' | 'video', value: string) => void;
  
  // Helpers
  getButtonStyles: (type: 'primary' | 'secondary') => { style: React.CSSProperties, className: string };
  hexToRgb: (hex: string) => string;
  adjustColor: (color: string, amount: number) => string;
}

const defaultSettings: ThemeSettings = {
  fontScale: 1,
  fontFamily: 'sans',
  lineHeight: 1.6,
  letterSpacing: 0,
  
  primaryColor: '#6366f1', // Indigo 500
  secondaryColor: '#64748b', // Slate 500
  successColor: '#10b981', // Emerald 500
  infoColor: '#0ea5e9', // Sky 500
  warningColor: '#f59e0b', // Amber 500
  errorColor: '#ef4444', // Red 500
  backgroundColor: '#0f172a',

  textColor: '#e2e8f0', // Slate 200
  mutedColor: '#94a3b8', // Slate 400
  highlightColor: '#818cf8', // Indigo 400
  textShadowColor: 'rgba(0,0,0,0.5)',
  borderColor: 'rgba(255, 255, 255, 0.1)', 
  shadowColor: '#000000',

  backgroundType: 'procedural',
  backgroundImage: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80',
  backgroundVideo: '',
  proceduralSet: 'aether',

  // Defaults for effects
  aetherConfig: {
    bgColor: '#0f172a', // Slate 900
    elementColor: '#818cf8', // Indigo 400
    speed: 0.3,
    intensity: 120 // Particle count
  },
  wavesConfig: {
    bgColor: '#1e1b4b', // Indigo 950
    elementColor: '#2dd4bf', // Teal 400
    speed: 1,
    intensity: 100 // Amplitude
  },
  cosmosConfig: {
    bgColor: '#020617', // Slate 950
    elementColor: '#e2e8f0', // Slate 200
    speed: 0.5,
    intensity: 400 // Star count
  },
  netConfig: {
    bgColor: '#111827', // Gray 900
    elementColor: '#38bdf8', // Sky 400
    speed: 0.5,
    intensity: 80 // Node count (keep lower for performance)
  },
  gridConfig: {
    bgColor: '#2a0a2e', // Deep Purple
    elementColor: '#d946ef', // Fuchsia 500
    speed: 1,
    intensity: 20 // Grid division density
  },

  buttonPrimary: {
    hasShadow: true,
    isGradient: true,
    hoverEffect: 'lift',
    rounded: 'full'
  },
  buttonSecondary: {
    hasShadow: false,
    isGradient: false,
    hoverEffect: 'scale',
    rounded: 'full'
  },

  cardConfig: {
    bgOpacity: 0.05,
    blur: 0,
    rounded: 12,
    padding: 16,
    hasBorder: true,
    hasShadow: false,
    gradientDirection: '135',
    gradientStart: '#ffffff',
    gradientEnd: '#ffffff',
  },

  modalConfig: {
    bgOpacity: 0.8,
    blur: 20,
    rounded: 16,
    padding: 20,
    hasBorder: true,
    hasShadow: true,
    gradientDirection: '135',
    gradientStart: '#1e293b',
    gradientEnd: '#0f172a',
  },

  containerConfig: {
    width: 95,
    maxWidth: 1400,
    height: 95, 
    padding: 0,
    margin: 3,
    bgOpacity: 0.05,
    backdropBlur: 10,
    radius: 20,
    hasShadow: true,
    hasBorder: true,
    fillSmaller: true,
    gradientDirection: '135',
    gradientStart: 'rgba(255,255,255,0.05)',
    gradientEnd: 'rgba(255,255,255,0.01)',
    overflow: 'hidden' 
  },

  language: 'en-US'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateMedia = (type: 'image' | 'video', value: string) => {
    setSettings(prev => ({
      ...prev,
      [type === 'image' ? 'backgroundImage' : 'backgroundVideo']: value
    }));
  };

  const updateButtonConfig = (type: 'primary' | 'secondary', key: keyof ButtonConfig, value: any) => {
    setSettings(prev => ({
      ...prev,
      [type === 'primary' ? 'buttonPrimary' : 'buttonSecondary']: {
        ...prev[type === 'primary' ? 'buttonPrimary' : 'buttonSecondary'],
        [key]: value
      }
    }));
  };

  const updateCardConfig = <K extends keyof CardConfig>(key: K, value: CardConfig[K]) => {
    setSettings(prev => ({
      ...prev,
      cardConfig: { ...prev.cardConfig, [key]: value }
    }));
  };

  const updateModalConfig = <K extends keyof ModalConfig>(key: K, value: ModalConfig[K]) => {
    setSettings(prev => ({
      ...prev,
      modalConfig: { ...prev.modalConfig, [key]: value }
    }));
  };

  const updateContainerConfig = <K extends keyof ContainerConfig>(key: K, value: ContainerConfig[K]) => {
    setSettings(prev => ({
      ...prev,
      containerConfig: { ...prev.containerConfig, [key]: value }
    }));
  };

  const updateProceduralConfig = (set: ThemeSettings['proceduralSet'], key: keyof ProceduralConfig, value: any) => {
    setSettings(prev => ({
      ...prev,
      [`${set}Config`]: {
        ...prev[`${set}Config` as keyof ThemeSettings] as ProceduralConfig,
        [key]: value
      }
    }));
  };

  // --- Helper Functions ---
  
  const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  }

  const getButtonStyles = (type: 'primary' | 'secondary') => {
    const config = type === 'primary' ? settings.buttonPrimary : settings.buttonSecondary;
    const baseColor = type === 'primary' ? settings.primaryColor : settings.secondaryColor;
    
    // Rounded classes map
    const roundedMap: Record<string, string> = {
      'none': '0px',
      'sm': '4px',
      'md': '8px',
      'lg': '12px',
      'full': '9999px'
    };

    const style: React.CSSProperties = {
      backgroundColor: config.isGradient ? undefined : baseColor,
      backgroundImage: config.isGradient ? `linear-gradient(135deg, ${baseColor}, ${adjustColor(baseColor, 40)})` : undefined,
      color: '#fff',
      borderRadius: roundedMap[config.rounded],
      boxShadow: config.hasShadow ? `0 4px 14px 0 ${settings.shadowColor}66` : 'none',
      border: 'none',
      cursor: 'pointer'
    };

    let className = "px-6 py-2 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ";
    
    if (config.hoverEffect === 'scale') className += "hover:scale-105 active:scale-95 ";
    if (config.hoverEffect === 'lift') className += "hover:-translate-y-1 hover:shadow-lg ";
    if (config.hoverEffect === 'glow') className += `hover:shadow-[0_0_20px_${baseColor}] `;
    
    return { style, className };
  };

  // Apply CSS variables and Global Font Scaling
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${settings.fontScale * 16}px`;
    
    // Colors
    root.style.setProperty('--color-primary', settings.primaryColor);
    root.style.setProperty('--color-secondary', settings.secondaryColor);
    root.style.setProperty('--color-success', settings.successColor);
    root.style.setProperty('--color-info', settings.infoColor);
    root.style.setProperty('--color-warning', settings.warningColor);
    root.style.setProperty('--color-error', settings.errorColor);
    
    root.style.setProperty('--color-text', settings.textColor);
    root.style.setProperty('--color-muted', settings.mutedColor);
    root.style.setProperty('--color-highlight', settings.highlightColor);
    
    root.style.setProperty('--color-text-shadow', settings.textShadowColor);
    root.style.setProperty('--color-border', settings.borderColor);
    root.style.setProperty('--color-shadow', settings.shadowColor);
  }, [settings]);

  return (
    <ThemeContext.Provider value={{ 
      settings, 
      updateSetting, 
      updateButtonConfig, 
      updateCardConfig, 
      updateModalConfig,
      updateContainerConfig, 
      updateProceduralConfig, 
      updateMedia,
      getButtonStyles,
      hexToRgb,
      adjustColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};