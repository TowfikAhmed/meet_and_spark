import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

interface Props {
  title: string;
  icon: React.ReactNode;
}

const PlaceholderApp: React.FC<Props> = ({ title, icon }) => {
  const { settings, hexToRgb } = useTheme();

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* App Header */}
        <header className="flex items-center gap-4 pb-4 border-b border-white/5">
          <div 
            className="p-3 rounded-xl bg-white/5 border border-white/5 shadow-sm"
            style={{ color: settings.primaryColor }}
          >
            {icon}
          </div>
          <div>
            <h2 style={{ color: settings.textColor }} className="text-xl font-light tracking-wide">{title}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></span>
                <p style={{ color: settings.mutedColor }} className="text-xs">Live & Synced</p>
            </div>
          </div>
        </header>

        {/* Dummy Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              style={{
                background: `linear-gradient(${settings.cardConfig.gradientDirection}deg, rgba(${hexToRgb(settings.cardConfig.gradientStart)}, 0.05), rgba(${hexToRgb(settings.cardConfig.gradientEnd)}, 0.02))`,
                borderRadius: `${settings.cardConfig.rounded}px`,
                borderColor: settings.borderColor,
                borderWidth: '1px'
              }}
              className="p-4 h-32 flex flex-col justify-between hover:bg-white/5 transition-colors cursor-default"
            >
              <div className="space-y-2">
                 <div className="h-2 w-1/3 bg-white/10 rounded animate-pulse"></div>
                 <div className="h-1.5 w-full bg-white/5 rounded"></div>
                 <div className="h-1.5 w-2/3 bg-white/5 rounded"></div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                 <div className="h-4 w-4 rounded-full bg-white/10"></div>
                 <div className="h-1.5 w-10 bg-white/5 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaceholderApp;