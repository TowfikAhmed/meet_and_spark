import React, { useEffect, useState } from 'react';
import { Layers, Camera, Zap, ArrowRight, Play } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface Props {
  onNavigate: (screen: 'auth' | 'workspace') => void;
}

const WelcomeScreen: React.FC<Props> = ({ onNavigate }) => {
  const { settings, getButtonStyles, hexToRgb } = useTheme();
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if app is running in standalone mode (PWA)
  useEffect(() => {
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };
    
    checkStandalone();
    window.addEventListener('resize', checkStandalone); // Sometimes display-mode changes on rotation/resize?
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  const primaryBtn = getButtonStyles('primary');
  const secondaryBtn = getButtonStyles('secondary');

  // Dynamic Feature Card Style
  const featureCardStyle: React.CSSProperties = {
    background: `linear-gradient(${settings.cardConfig.gradientDirection}deg, rgba(${hexToRgb(settings.cardConfig.gradientStart)}, ${settings.cardConfig.bgOpacity}), rgba(${hexToRgb(settings.cardConfig.gradientEnd)}, ${settings.cardConfig.bgOpacity}))`,
    backdropFilter: `blur(${settings.cardConfig.blur}px)`,
    borderRadius: `${settings.cardConfig.rounded}px`,
    padding: `${settings.cardConfig.padding}px`,
    borderWidth: settings.cardConfig.hasBorder ? '1px' : '0px',
    borderColor: settings.borderColor,
    boxShadow: settings.cardConfig.hasShadow ? `0 10px 25px -5px rgba(${hexToRgb(settings.shadowColor)}, 0.3)` : 'none',
  };

  const handleInstallClick = () => {
    // In a real PWA, you would trigger the beforeinstallprompt event here.
    // Since we are simulating or assuming the browser handles the UI, we alert.
    alert("To install, tap the 'Share' button (iOS) or the three dots (Android/Desktop) and select 'Add to Home Screen'.");
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-8">
      <div className="flex flex-col items-center justify-center min-h-full py-12">
        
        <div className="flex flex-col items-center text-center space-y-[1.5em] max-w-4xl mx-auto">
          
          <h1 
            style={{
              backgroundImage: `linear-gradient(to right, ${settings.infoColor}, ${settings.highlightColor}, ${settings.successColor})`
            }}
            className="text-[2.5em] md:text-[4em] leading-tight font-extralight tracking-tight text-transparent bg-clip-text drop-shadow-sm"
          >
            Unified Workspace
          </h1>
          
          <p 
            style={{ color: settings.mutedColor }}
            className="text-[1.1em] font-light max-w-xl leading-relaxed"
          >
            A procedural, immersive environment for modern collaboration. Experience messaging, mailing, and conferencing in a reactive aether.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1em] w-full mt-[2em] pt-[2em] border-t border-white/5">
            <div style={featureCardStyle} className="hover:bg-white/5 transition-colors duration-300 flex flex-col items-center md:items-start text-center md:text-left group">
              <div className="p-2 rounded-lg bg-white/5 mb-3 group-hover:scale-110 transition-transform">
                 <Camera className="w-[1.25em] h-[1.25em]" style={{ color: settings.infoColor }} />
              </div>
              <h3 style={{ color: settings.textColor }} className="text-[0.9em] font-semibold mb-[0.25em]">Immersive</h3>
              <p style={{ color: settings.mutedColor }} className="text-[0.75em] leading-relaxed">Dynamic parallax backgrounds and responsive fluid UI.</p>
            </div>
            
            <div style={featureCardStyle} className="hover:bg-white/5 transition-colors duration-300 flex flex-col items-center md:items-start text-center md:text-left group">
              <div className="p-2 rounded-lg bg-white/5 mb-3 group-hover:scale-110 transition-transform">
                 <Zap className="w-[1.25em] h-[1.25em]" style={{ color: settings.warningColor }} />
              </div>
              <h3 style={{ color: settings.textColor }} className="text-[0.9em] font-semibold mb-[0.25em]">Real-time</h3>
              <p style={{ color: settings.mutedColor }} className="text-[0.75em] leading-relaxed">Instant state synchronization across all connected clients.</p>
            </div>

            <div style={featureCardStyle} className="hover:bg-white/5 transition-colors duration-300 flex flex-col items-center md:items-start text-center md:text-left group">
              <div className="p-2 rounded-lg bg-white/5 mb-3 group-hover:scale-110 transition-transform">
                 <Layers className="w-[1.25em] h-[1.25em]" style={{ color: settings.successColor }} />
              </div>
              <h3 style={{ color: settings.textColor }} className="text-[0.9em] font-semibold mb-[0.25em]">Unified</h3>
              <p style={{ color: settings.mutedColor }} className="text-[0.75em] leading-relaxed">All your productivity tools seamlessly integrated in one place.</p>
            </div>
          </div>

          <div className="pt-[2em] flex flex-wrap gap-4 justify-center">
            {isInstalled ? (
              <button 
                style={primaryBtn.style}
                className={primaryBtn.className}
                onClick={() => onNavigate('auth')}
              >
                Continue <Play size={16} fill="currentColor" />
              </button>
            ) : (
              <>
                <button 
                  style={primaryBtn.style}
                  className={primaryBtn.className}
                  onClick={handleInstallClick}
                >
                  Install App
                </button>
                <button 
                  style={secondaryBtn.style}
                  className={secondaryBtn.className}
                  onClick={() => onNavigate('auth')}
                >
                  Use in Web <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;