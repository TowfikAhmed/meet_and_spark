import React, { useEffect } from 'react';
import { User, Bell, Lock, Globe, Moon, CreditCard, ToggleLeft } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface Props {
  activeSection?: string;
}

const SettingsApp: React.FC<Props> = ({ activeSection }) => {
  const { settings, getButtonStyles, hexToRgb } = useTheme();
  const primaryBtn = getButtonStyles('primary');
  const secondaryBtn = getButtonStyles('secondary');

  useEffect(() => {
    if (activeSection) {
      const el = document.getElementById(activeSection);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSection]);

  // Reusable Card Style for UI elements
  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(${settings.cardConfig.gradientDirection}deg, rgba(${hexToRgb(settings.cardConfig.gradientStart)}, ${settings.cardConfig.bgOpacity}), rgba(${hexToRgb(settings.cardConfig.gradientEnd)}, ${settings.cardConfig.bgOpacity}), rgba(${hexToRgb(settings.cardConfig.gradientEnd)}, ${settings.cardConfig.bgOpacity}))`,
    backdropFilter: `blur(${settings.cardConfig.blur}px)`,
    borderRadius: `${settings.cardConfig.rounded}px`,
    border: settings.cardConfig.hasBorder ? `1px solid ${settings.borderColor}` : 'none',
    boxShadow: settings.cardConfig.hasShadow ? `0 4px 6px -1px ${settings.shadowColor}40` : 'none',
    padding: `${settings.cardConfig.padding}px`
  };

  const SectionTitle: React.FC<{ icon: any, title: string }> = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: settings.borderColor }}>
       <Icon size={16} className="text-[var(--color-primary)]" />
       <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">{title}</h3>
    </div>
  );

  const InputGroup: React.FC<{ label: string, value: string, type?: string }> = ({ label, value, type = "text" }) => (
    <div className="space-y-1.5">
       <label className="text-xs font-medium text-[var(--color-muted)]">{label}</label>
       <input 
         type={type} 
         defaultValue={value}
         className="w-full px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors bg-white/5 border border-white/10 focus:border-[var(--color-primary)]"
         style={{ borderRadius: '4px' }}
       />
    </div>
  );

  const ToggleRow: React.FC<{ label: string, checked?: boolean }> = ({ label, checked = false }) => (
    <div className="flex items-center justify-between py-2">
       <span className="text-sm text-[var(--color-text)]">{label}</span>
       <button 
        className={`w-10 h-5 rounded-full relative transition-colors`}
        style={{ backgroundColor: checked ? settings.primaryColor : settings.secondaryColor }}
       >
          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${checked ? 'left-6' : 'left-1'}`}></div>
       </button>
    </div>
  );

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
           <h1 className="text-3xl font-light text-[var(--color-text)] mb-2">Settings</h1>
           <p className="text-[var(--color-muted)]">Manage your account preferences and application workspace.</p>
        </div>

        {/* Profile Section */}
        <section id="profile">
           <SectionTitle icon={User} title="Profile & Account" />
           <div className="flex items-start gap-6 mb-6">
              <div className="relative group cursor-pointer">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    JD
                 </div>
                 <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white">Change</span>
                 </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputGroup label="Full Name" value="John Doe" />
                 <InputGroup label="Email" value="john.doe@example.com" type="email" />
                 <InputGroup label="Job Title" value="Product Designer" />
                 <InputGroup label="Department" value="Design Systems" />
              </div>
           </div>
        </section>

        {/* Notifications */}
        <section id="notifications">
           <SectionTitle icon={Bell} title="Notifications" />
           <div style={cardStyle} className="space-y-1">
              <ToggleRow label="Email Notifications" checked />
              <ToggleRow label="Desktop Push Notifications" checked />
              <ToggleRow label="Weekly Digest" />
              <ToggleRow label="Meeting Reminders (10m before)" checked />
           </div>
        </section>

        {/* Security */}
        <section id="privacy">
           <SectionTitle icon={Lock} title="Privacy & Security" />
           <div className="space-y-4">
              <div style={cardStyle} className="flex justify-between items-center">
                 <div>
                    <h4 className="text-sm font-medium text-[var(--color-text)]">Two-Factor Authentication</h4>
                    <p className="text-xs text-[var(--color-muted)] mt-1">Add an extra layer of security to your account.</p>
                 </div>
                 <button style={secondaryBtn.style} className={`${secondaryBtn.className} !px-4 !py-1 !text-xs`}>
                    Enable
                 </button>
              </div>
              <div style={cardStyle} className="flex justify-between items-center">
                 <div>
                    <h4 className="text-sm font-medium text-[var(--color-text)]">Active Sessions</h4>
                    <p className="text-xs text-[var(--color-muted)] mt-1">You are logged in on 2 other devices.</p>
                 </div>
                 <button className="text-xs text-[var(--color-error)] hover:underline">
                    Sign out all
                 </button>
              </div>
           </div>
        </section>

        {/* Actions */}
        <div className="pt-6 border-t flex justify-end gap-3" style={{ borderColor: settings.borderColor }}>
           <button style={secondaryBtn.style} className={secondaryBtn.className}>
             Cancel
           </button>
           <button style={primaryBtn.style} className={primaryBtn.className}>
             Save Changes
           </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsApp;