import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Users, MessageSquare, Share, Settings, Calendar, Clock, Plus, Link as LinkIcon, Lock, Globe } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface Props {
  isInMeeting: boolean;
  onMeetingEnd: () => void;
  onOpenCreateMeeting?: () => void;
}

const ConferencingApp: React.FC<Props> = ({ isInMeeting, onMeetingEnd, onOpenCreateMeeting }) => {
  const { settings, hexToRgb, getButtonStyles } = useTheme();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const primaryBtn = getButtonStyles('primary');

  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(${settings.cardConfig.gradientDirection}deg, rgba(${hexToRgb(settings.cardConfig.gradientStart)}, ${settings.cardConfig.bgOpacity}), rgba(${hexToRgb(settings.cardConfig.gradientEnd)}, ${settings.cardConfig.bgOpacity}))`,
    backdropFilter: `blur(${settings.cardConfig.blur}px)`,
    borderRadius: `${settings.cardConfig.rounded}px`,
    border: settings.cardConfig.hasBorder ? `1px solid ${settings.borderColor}` : 'none',
    boxShadow: settings.cardConfig.hasShadow ? `0 4px 6px -1px ${settings.shadowColor}40` : 'none',
    padding: `${settings.cardConfig.padding}px`
  };

  if (isInMeeting) {
     return (
       <div className="flex flex-col h-full w-full bg-black/40 relative animate-in fade-in duration-500">
          <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
             {[
               { name: 'You', color: settings.primaryColor, active: true },
               { name: 'Alice', color: settings.infoColor, active: false },
               { name: 'Bob', color: settings.successColor, active: false },
               { name: 'Sarah', color: settings.warningColor, active: true }
             ].map((user, i) => (
               <div key={i} style={cardStyle} className="relative overflow-hidden flex items-center justify-center group">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg" style={{ backgroundColor: user.color }}>{user.name.charAt(0)}</div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                     <span className="text-xs text-white font-medium">{user.name}</span>
                     {user.active && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                  </div>
                  {user.active && <div className="absolute inset-0 border-2 rounded-2xl opacity-50 transition-colors" style={{ borderColor: settings.primaryColor, borderRadius: `${settings.cardConfig.rounded}px` }}></div>}
               </div>
             ))}
          </div>
          <div className="flex-none h-20 flex items-center justify-center gap-4 px-6 border-t border-white/10 bg-slate-900/90 backdrop-blur-xl" style={{ borderTopColor: settings.borderColor }}>
             <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-full transition-all ${micOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>{micOn ? <Mic size={20} /> : <MicOff size={20} />}</button>
             <button onClick={() => setCamOn(!camOn)} className={`p-4 rounded-full transition-all ${camOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>{camOn ? <Video size={20} /> : <VideoOff size={20} />}</button>
             <div className="w-px h-8 bg-white/10 mx-2"></div>
             <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><Share size={20} /></button>
             <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><MessageSquare size={20} /></button>
             <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><Users size={20} /></button>
             <button onClick={onMeetingEnd} className="ml-4 px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium shadow-lg hover:shadow-red-500/25 transition-all flex items-center gap-2"><PhoneOff size={20} /> End</button>
          </div>
       </div>
     );
  }

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar p-6 md:p-10">
       <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-12">
             <div className="space-y-4">
                <h1 className="text-4xl font-light text-[var(--color-text)]">Ready to connect?</h1>
                <p className="text-[var(--color-muted)] max-w-md">Start an instant high-quality video conference or schedule one for later with your team.</p>
                <div className="flex gap-4 pt-2">
                   <button 
                     onClick={onOpenCreateMeeting}
                     style={primaryBtn.style} 
                     className={`${primaryBtn.className} !py-3 !px-8 text-base shadow-xl`}
                   >
                      <Video size={18} /> New Meeting
                   </button>
                   <div className="relative group">
                      <input type="text" placeholder="Enter code" className="h-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-full text-sm outline-none focus:border-[var(--color-primary)] transition-colors w-40 focus:w-48" style={{ color: settings.textColor }} />
                      <button className="absolute right-1 top-1 bottom-1 p-2 text-[var(--color-muted)] hover:text-[var(--color-text)]"><LinkIcon size={16} /></button>
                   </div>
                </div>
             </div>
             <div className="hidden md:block w-64 h-48 relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-info)] opacity-20 blur-3xl rounded-full"></div>
                 <div className="absolute inset-4 border border-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2 p-2 w-full h-full opacity-50">
                       <div className="bg-white/10 rounded-lg animate-pulse"></div>
                       <div className="bg-white/5 rounded-lg"></div>
                       <div className="bg-white/5 rounded-lg"></div>
                       <div className="bg-white/10 rounded-lg animate-pulse delay-75"></div>
                    </div>
                 </div>
             </div>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">Upcoming Meetings</h3>
                <button className="text-xs text-[var(--color-primary)] hover:underline">View Calendar</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                   { title: 'Weekly Design Sync', time: '10:00 - 11:00 AM', status: 'In Progress', users: 4, type: 'public' },
                   { title: 'Project Kickoff', time: '1:00 - 2:00 PM', status: 'Later', users: 8, type: 'private' },
                   { title: '1:1 Manager Review', time: '3:30 - 4:00 PM', status: 'Later', users: 2, type: 'private' }
                ].map((mtg, i) => (
                   <div key={i} style={cardStyle} className="hover:brightness-110 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                         <div className="p-2 rounded-lg bg-white/5 text-[var(--color-info)]"><Calendar size={20} /></div>
                         {mtg.status === 'In Progress' && <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">NOW</span>}
                         {mtg.status !== 'In Progress' && (
                            mtg.type === 'private' ? <Lock size={14} className="text-[var(--color-muted)]" /> : <Globe size={14} className="text-[var(--color-muted)]" />
                         )}
                      </div>
                      <h4 className="text-lg font-medium text-[var(--color-text)] mb-1">{mtg.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
                         <span className="flex items-center gap-1"><Clock size={12} /> {mtg.time}</span>
                         <span className="flex items-center gap-1"><Users size={12} /> {mtg.users}</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default ConferencingApp;