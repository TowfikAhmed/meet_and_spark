import React, { useState, useEffect, Suspense } from 'react';
import {
  Command,
  Menu,
  LogOut,
  User,
  PlusCircle,
  MessageSquare,
  Mail,
  Video,
  Settings,
  Bell,
  PenSquare,
  UserPlus,
  Users,
  Trash2,
  Hash,
  Inbox,
  Send,
  AlertOctagon,
  Calendar,
  Link as LinkIcon,
  Clock,
  CheckCircle,
  Plus,
  Shield,
  CreditCard,
  HelpCircle,
  BellRing,
  Search,
  X,
  Check,
  Phone,
  PhoneCall,
  Star,
  FileText,
  Globe,
  Lock,
  Play,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useTheme } from '../context/ThemeContext';

// Import Effects for Preview
import EffectAether from '@/components/EffectAether';
import EffectWaves from '@/components/EffectWaves';
import EffectCosmos from '@/components/EffectCosmos';
import EffectNet from '@/components/EffectNet';
import EffectGrid from '@/components/EffectGrid';

// Lazy load the content of the apps
const MessagingApp = React.lazy(() => import('./apps/MessagingApp'));
const MailingApp = React.lazy(() => import('./apps/MailingApp'));
const ConferencingApp = React.lazy(() => import('./apps/ConferencingApp'));
const SettingsApp = React.lazy(() => import('./apps/SettingsApp'));
const PlaceholderApp = React.lazy(() => import('./apps/PlaceholderApp'));

interface Props {
  onLogout: () => void;
}

type SubApp = 'messaging' | 'mailing' | 'conferencing' | 'settings';

interface MeetingConfig {
  title: string;
  isScheduled: boolean;
  date: string;
  time: string;
  privacy: 'private' | 'public';
  permissions: 'all' | 'viewers';
  joinType: 'auto' | 'ask';
  screenTitle: string;
  bgType: 'procedural' | 'image' | 'video' | 'color';
  bgValue: string; // procedural set name or url
}

const defaultChats = [
  { id: '1', name: 'Alice Cooper', online: true, msg: 'Typing...', group: false },
  { id: '2', name: 'Bob Smith', online: false, msg: 'See you tmrw', group: false },
  { id: '3', name: 'Project Alpha', online: true, group: true, msg: 'New update pushed' },
  { id: '4', name: 'Sarah Jones', online: true, msg: 'Thanks!', group: false },
];

const WorkspaceScreen: React.FC<Props> = ({ onLogout }) => {
  const [activeApp, setActiveApp] = useState<SubApp>('messaging');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- App State ---
  // Messaging
  const [chats, setChats] = useState(defaultChats);
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    name: string;
    group: boolean;
    online?: boolean;
    msg?: string;
  } | null>(null);

  // Modals State
  const [activeModal, setActiveModal] = useState<'none' | 'newChat' | 'addContact' | 'newMeeting'>(
    'none',
  );
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Mailing
  const [mailFolder, setMailFolder] = useState<string>('Inbox');
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState<{
    to: string;
    subject: string;
    body: string;
  } | null>(null);
  const [mailLabels, setMailLabels] = useState(['Work', 'Personal', 'Travel']);

  // Conferencing
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [meetingConfig, setMeetingConfig] = useState<MeetingConfig>({
    title: 'New Meeting',
    isScheduled: false,
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    privacy: 'private',
    permissions: 'all',
    joinType: 'ask',
    screenTitle: 'Waiting for host...',
    bgType: 'procedural',
    bgValue: 'aether',
  });

  // Settings
  const [activeSettingsSection, setActiveSettingsSection] = useState<string>('profile');

  const { settings, hexToRgb, getButtonStyles } = useTheme();
  const primaryBtn = getButtonStyles('primary');

  // User State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = React.useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !anonKey) {
      console.error('Supabase credentials missing');
      return null;
    }
    return createClient(url, anonKey);
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    onLogout();
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Fetch User Info
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUserEmail(data.user.email ?? null);
          setDisplayName(data.user.user_metadata?.display_name ?? null);
        }
      });
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [supabase]);

  // --- Modal Logic ---

  // New Chat / Group Logic
  const [isGroupMode, setGroupMode] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const potentialContacts = [
    { id: 'u1', name: 'Emma Wilson', email: 'emma@example.com' },
    { id: 'u2', name: 'Liam Brown', email: 'liam@example.com' },
    { id: 'u3', name: 'Noah Davis', email: 'noah@example.com' },
    { id: 'u4', name: 'Olivia Miller', email: 'olivia@example.com' },
  ];

  const handleCreateChat = (contactId?: string) => {
    let newChat;

    if (isGroupMode) {
      if (!groupName || selectedGroupMembers.length === 0) return;
      newChat = {
        id: Date.now().toString(),
        name: groupName,
        online: true,
        msg: 'Group Created',
        group: true,
      };
    } else {
      const contact = potentialContacts.find((c) => c.id === contactId);
      if (!contact) return;
      newChat = {
        id: Date.now().toString(),
        name: contact.name,
        online: true,
        msg: 'Draft',
        group: false,
      };
    }

    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
    setActiveModal('none');
    setGroupMode(false);
    setSelectedGroupMembers([]);
    setGroupName('');
    setActiveApp('messaging');
    if (isMobile) setSidebarOpen(false);
  };

  const toggleGroupMember = (id: string) => {
    if (selectedGroupMembers.includes(id)) {
      setSelectedGroupMembers((prev) => prev.filter((m) => m !== id));
    } else {
      setSelectedGroupMembers((prev) => [...prev, id]);
    }
  };

  // --- Actions ---

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (selectedChat?.id === chatId) setSelectedChat(null);
  };

  const handleCompose = (initialData?: { to: string; subject: string; body: string }) => {
    setActiveApp('mailing');
    setComposeData(initialData || null);
    setIsComposing(true);
    if (isMobile) setSidebarOpen(false);
  };

  const handleOpenCreateMeeting = () => {
    setActiveModal('newMeeting');
    if (isMobile) setSidebarOpen(false);
  };

  const handleStartMeeting = () => {
    setActiveApp('conferencing');
    setIsInMeeting(true);
    setActiveModal('none');
    if (isMobile) setSidebarOpen(false);
  };

  const handleSettingsNav = (section: string) => {
    setActiveApp('settings');
    setActiveSettingsSection(section);
    if (isMobile) setSidebarOpen(false);
  };

  // Helper to construct Card-like background styles
  const cardLikeStyle = {
    background: `linear-gradient(${settings.cardConfig.gradientDirection}deg, rgba(${hexToRgb(settings.cardConfig.gradientStart)}, ${settings.cardConfig.bgOpacity}), rgba(${hexToRgb(settings.cardConfig.gradientEnd)}, ${settings.cardConfig.bgOpacity}))`,
    backdropFilter: `blur(${settings.cardConfig.blur}px)`,
  };

  // Modal Like Style helper (using modalConfig)
  const modalLikeStyle = {
    background: `linear-gradient(${settings.modalConfig.gradientDirection}deg, rgba(${hexToRgb(settings.modalConfig.gradientStart)}, ${settings.modalConfig.bgOpacity}), rgba(${hexToRgb(settings.modalConfig.gradientEnd)}, ${settings.modalConfig.bgOpacity}))`,
    backdropFilter: `blur(${settings.modalConfig.blur}px)`,
    borderRadius: `${settings.modalConfig.rounded}px`,
    border: settings.modalConfig.hasBorder ? `1px solid ${settings.borderColor}` : 'none',
    boxShadow: settings.modalConfig.hasShadow
      ? `0 20px 50px -10px ${settings.shadowColor}80`
      : 'none',
    padding: `${settings.modalConfig.padding}px`,
  };

  // Reusable modal style (extended from modalLikeStyle)
  const modalStyle: React.CSSProperties = {
    ...modalLikeStyle,
    backgroundColor: settings.backgroundColor,
  };

  // Style for inputs/selects inside modals to match the modal's theme
  const modalInputStyle: React.CSSProperties = {
    background: `linear-gradient(${settings.modalConfig.gradientDirection}deg, rgba(${hexToRgb(settings.modalConfig.gradientStart)}, 0.2), rgba(${hexToRgb(settings.modalConfig.gradientEnd)}, 0.1))`,
    backdropFilter: `blur(${settings.modalConfig.blur}px)`,
    border: `1px solid ${settings.borderColor}`,
    color: settings.textColor,
    borderRadius: '6px',
  };

  // Helper to get the base background color for the preview screen based on config
  const getPreviewBgColor = () => {
    if (meetingConfig.bgType === 'procedural') {
      switch (meetingConfig.bgValue) {
        case 'aether':
          return settings.aetherConfig.bgColor;
        case 'waves':
          return settings.wavesConfig.bgColor;
        case 'cosmos':
          return settings.cosmosConfig.bgColor;
        case 'net':
          return settings.netConfig.bgColor;
        case 'grid':
          return settings.gridConfig.bgColor;
        default:
          return settings.backgroundColor;
      }
    }
    if (meetingConfig.bgType === 'color') return meetingConfig.bgValue;
    return settings.backgroundColor; // Default fallback
  };

  // Header Style
  const headerStyle: React.CSSProperties = {
    ...cardLikeStyle,
    height: '56px',
    paddingLeft: `${settings.cardConfig.padding}px`,
    paddingRight: `${settings.cardConfig.padding}px`,
    borderBottom: `1px solid ${settings.borderColor}`,
  };

  // Sidebar Style
  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        ...modalLikeStyle,
        width: '280px',
        borderRight: `1px solid ${settings.borderColor}`,
      }
    : {
        ...cardLikeStyle,
        borderRight: `1px solid ${settings.borderColor}`,
        width: '240px',
        padding: `${settings.cardConfig.padding}px`,
      };

  const navItemClass = (isActive: boolean) => `
    w-full flex items-center gap-3 px-2 py-1.5 text-xs font-medium transition-all rounded-md
    ${
      isActive
        ? `bg-white/10 text-[var(--color-text)]`
        : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
    }
  `;

  const actionLinkClass = `
    w-full flex items-center gap-3 px-2 py-1.5 text-xs font-medium transition-all rounded-md
    text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 cursor-pointer whitespace-nowrap
  `;

  const activeColorStyle = (isActive: boolean) =>
    isActive ? { color: settings.primaryColor } : {};

  // Handle mobile sidebar auto-close
  const handleSidebarSelection = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const handleAddLabel = () => {
    const newLabel = `Label ${mailLabels.length + 1}`;
    setMailLabels([...mailLabels, newLabel]);
  };

  const handleRemoveLabel = (label: string) => {
    setMailLabels(mailLabels.filter((l) => l !== label));
  };

  // Render content based on active selection
  const renderContent = () => {
    const LoadingFallback = () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      </div>
    );

    return (
      <Suspense fallback={<LoadingFallback />}>
        {activeApp === 'messaging' && (
          <MessagingApp
            key="messaging"
            chatId={selectedChat?.id || null}
            chatName={selectedChat?.name || ''}
            isGroup={selectedChat?.group || false}
            onDeleteChat={handleDeleteChat}
          />
        )}
        {activeApp === 'mailing' && (
          <MailingApp
            key="mailing"
            folder={mailFolder}
            isComposing={isComposing}
            initialComposeData={composeData}
            onReplyForward={(data) => handleCompose(data)}
            onCloseCompose={() => {
              setIsComposing(false);
              setComposeData(null);
            }}
          />
        )}
        {activeApp === 'conferencing' && (
          <ConferencingApp
            key="conferencing"
            isInMeeting={isInMeeting}
            onMeetingEnd={() => setIsInMeeting(false)}
            onOpenCreateMeeting={handleOpenCreateMeeting}
          />
        )}
        {activeApp === 'settings' && (
          <SettingsApp key="settings" activeSection={activeSettingsSection} />
        )}
      </Suspense>
    );
  };

  const renderSidebarContent = () => {
    const wrapperClass = 'flex flex-col h-full animate-slide-in overflow-hidden';

    switch (activeApp) {
      /* --- MESSAGING MENU --- */
      case 'messaging':
        return (
          <div key="messaging" className={wrapperClass}>
            <div className="space-y-0.5 mb-4 shrink-0">
              <button className={actionLinkClass} onClick={() => setActiveModal('newChat')}>
                <PlusCircle size={14} className="text-[var(--color-primary)]" /> New Chat
              </button>
              <button className={actionLinkClass} onClick={() => setActiveModal('addContact')}>
                <UserPlus size={14} className="text-[var(--color-muted)]" /> Add Contact
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
              <div className="px-2 text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2 sticky top-0 z-10">
                Recent
              </div>
              <div className="space-y-0.5">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat);
                      handleSidebarSelection();
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/5 group text-left transition-colors ${selectedChat?.id === chat.id ? 'bg-white/10' : ''}`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${chat.group ? 'bg-[var(--color-primary)] bg-opacity-20 text-[var(--color-primary)]' : 'bg-slate-700 text-[var(--color-muted)]'}`}
                      >
                        {chat.group ? <Users size={12} /> : chat.name.charAt(0)}
                      </div>
                      {chat.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-success)] border border-slate-900"></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-xs font-medium truncate ${selectedChat?.id === chat.id ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-text)]'}`}
                        >
                          {chat.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--color-muted)] truncate">{chat.msg}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      /* --- MAILING MENU --- */
      case 'mailing':
        return (
          <div key="mailing" className={wrapperClass}>
            <div className="mb-4 shrink-0">
              <button className={actionLinkClass} onClick={() => handleCompose()}>
                <PenSquare size={14} className="text-[var(--color-success)]" />
                <span>Compose</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-6">
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setMailFolder('Inbox');
                    handleSidebarSelection();
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md ${mailFolder === 'Inbox' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-muted)] hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Inbox size={14} /> Inbox
                  </div>
                  <span className="text-[10px] font-bold bg-white/20 px-1.5 rounded-full">3</span>
                </button>
                <button
                  onClick={() => {
                    setMailFolder('Starred');
                    handleSidebarSelection();
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium ${mailFolder === 'Starred' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-muted)] hover:bg-white/5'}`}
                >
                  <Star size={14} /> Starred
                </button>
                <button
                  onClick={() => {
                    setMailFolder('Drafts');
                    handleSidebarSelection();
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium ${mailFolder === 'Drafts' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-muted)] hover:bg-white/5'}`}
                >
                  <FileText size={14} /> Drafts
                </button>
                <button
                  onClick={() => {
                    setMailFolder('Sent');
                    handleSidebarSelection();
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium ${mailFolder === 'Sent' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-muted)] hover:bg-white/5'}`}
                >
                  <Send size={14} /> Sent
                </button>
                <button
                  onClick={() => {
                    setMailFolder('Spam');
                    handleSidebarSelection();
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium ${mailFolder === 'Spam' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-muted)] hover:bg-white/5'}`}
                >
                  <AlertOctagon size={14} /> Spam
                </button>
                <button
                  onClick={() => {
                    setMailFolder('Trash');
                    handleSidebarSelection();
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium ${mailFolder === 'Trash' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-muted)] hover:bg-white/5'}`}
                >
                  <Trash2 size={14} /> Trash
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 px-2 sticky top-0 bg-transparent z-10">
                  <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest">
                    Labels
                  </span>
                  <button
                    onClick={handleAddLabel}
                    className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div className="space-y-0.5">
                  {mailLabels.map((label) => (
                    <div
                      key={label}
                      onClick={() => {
                        setMailFolder(label);
                        handleSidebarSelection();
                      }}
                      className={`group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer text-xs ${mailFolder === label ? 'text-[var(--color-text)] bg-white/5' : 'text-[var(--color-muted)]'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash size={12} style={{ color: settings.infoColor }} />
                        {label}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLabel(label);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[var(--color-muted)] hover:text-[var(--color-error)] transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      /* --- CONFERENCING MENU --- */
      case 'conferencing':
        return (
          <div key="conferencing" className={wrapperClass}>
            <div className="space-y-0.5 mb-4 shrink-0">
              <button className={actionLinkClass} onClick={handleOpenCreateMeeting}>
                <Video size={14} className="text-[var(--color-primary)]" /> New Meeting
              </button>
              <button className={actionLinkClass} onClick={handleOpenCreateMeeting}>
                <LinkIcon size={14} className="text-[var(--color-muted)]" /> Join via Code
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-4">
              <div>
                <div className="px-2 text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2 sticky top-0 bg-transparent z-10">
                  Upcoming
                </div>
                <div className="p-2 rounded border border-white/5 bg-white/[0.02] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text)]">
                    <Calendar size={12} className="text-[var(--color-primary)]" />
                    <span>Design Sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
                    <Clock size={10} />
                    <span>10:00 AM - 11:00 AM</span>
                  </div>
                  <button
                    onClick={handleStartMeeting}
                    className="w-full py-1 mt-1 text-[10px] bg-white/5 hover:bg-white/10 rounded text-[var(--color-success)] transition-colors"
                  >
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      /* --- SETTINGS MENU --- */
      case 'settings':
        return (
          <div key="settings" className={wrapperClass}>
            <div className="mb-4 px-2 shrink-0">
              <h3 className="text-xs font-semibold text-[var(--color-text)]">General</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-1">
              {[
                { label: 'Profile & Account', icon: User, id: 'profile' },
                { label: 'Notifications', icon: BellRing, id: 'notifications' },
                { label: 'Privacy & Security', icon: Shield, id: 'privacy' },
              ].map((item, i) => (
                <button
                  key={i}
                  className={actionLinkClass}
                  onClick={() => handleSettingsNav(item.id)}
                >
                  <item.icon size={14} className="text-[var(--color-muted)]" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      {/* --- Header --- */}
      <header
        style={headerStyle}
        className="flex-none flex items-center justify-between z-30 shrink-0 transition-all duration-300 "
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-1.5 text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-white/5 border border-white/5">
              <Command size={14} style={{ color: settings.primaryColor }} />
            </div>
            <span
              className="font-semibold tracking-tight text-sm"
              style={{ color: settings.textColor }}
            >
              Unified Workspace
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
            <Bell size={16} />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1"></div>

            {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-full transition-colors border border-transparent hover:border-white/10"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-[var(--color-text)] shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                }}
              >
                {(displayName || userEmail || 'U').charAt(0).toUpperCase()}
              </div>
            </button>

            {isProfileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 animate-in fade-in zoom-in-95 z-50 overflow-hidden"
                style={{
                  ...modalLikeStyle,
                  backgroundColor: settings.backgroundColor,
                  padding: 0,
                }}
              >
                <div className="p-3 border-b border-white/5">
                  <p className="text-xs font-medium text-[var(--color-text)]">{displayName || 'User'}</p>
                  <p className="text-[10px] text-[var(--color-muted)]">{userEmail || 'No Email'}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-[10px] text-[var(--color-error)] hover:bg-red-400/10 rounded"
                  >
                    <LogOut size={12} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Layout --- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside
          style={sidebarStyle}
          className={` !rounded-none
             absolute md:relative z-40 h-full transition-all duration-300 shrink-0 flex flex-col top-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Top: Dynamic App Content */}
          <div className="flex-1 overflow-hidden flex flex-col">{renderSidebarContent()}</div>

          {/* Divider */}
          <div className="h-px w-full bg-white/5 my-2 shrink-0"></div>

          {/* Bottom: App Navigation */}
          <div className="shrink-0 space-y-0.5">
            <p className="px-2 text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest mb-1.5">
              Apps
            </p>

            <button
              onClick={() => setActiveApp('messaging')}
              className={navItemClass(activeApp === 'messaging')}
              style={activeColorStyle(activeApp === 'messaging')}
            >
              <MessageSquare size={14} />
              Messaging
            </button>

            <button
              onClick={() => setActiveApp('mailing')}
              className={navItemClass(activeApp === 'mailing')}
              style={activeColorStyle(activeApp === 'mailing')}
            >
              <Mail size={14} />
              Mailing
            </button>

            <button
              onClick={() => setActiveApp('conferencing')}
              className={navItemClass(activeApp === 'conferencing')}
              style={activeColorStyle(activeApp === 'conferencing')}
            >
              <Video size={14} />
              Conferencing
            </button>

            <button
              onClick={() => setActiveApp('settings')}
              className={navItemClass(activeApp === 'settings')}
              style={activeColorStyle(activeApp === 'settings')}
            >
              <Settings size={14} />
              Settings
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-white/[0.02]">{renderContent()}</main>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* New Chat Modal */}
      {activeModal === 'newChat' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            style={modalStyle}
            className="w-full max-w-sm flex flex-col animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">New Conversation</h3>
              <button
                onClick={() => setActiveModal('none')}
                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[var(--color-muted)]" />
                <input
                  type="text"
                  placeholder="Search people..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded-md outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                />
              </div>

              {/* Create Group Toggle */}
              <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                <span className="text-xs text-[var(--color-text)]">Create Group Chat</span>
                <button
                  onClick={() => setGroupMode(!isGroupMode)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${isGroupMode ? 'bg-[var(--color-primary)]' : 'bg-slate-700'}`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isGroupMode ? 'left-4.5 translate-x-0' : 'left-0.5'}`}
                    style={{ left: isGroupMode ? 'calc(100% - 14px)' : '2px' }}
                  />
                </button>
              </div>

              {isGroupMode && (
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-md outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                />
              )}

              {/* Contact List */}
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                {potentialContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() =>
                      isGroupMode ? toggleGroupMember(contact.id) : handleCreateChat(contact.id)
                    }
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-white/5 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-medium text-[var(--color-text)]">
                          {contact.name}
                        </div>
                        <div className="text-[10px] text-[var(--color-muted)]">{contact.email}</div>
                      </div>
                    </div>
                    {isGroupMode && (
                      <div
                        className={`w-4 h-4 rounded-full border border-white/20 flex items-center justify-center ${selectedGroupMembers.includes(contact.id) ? 'bg-[var(--color-primary)] border-none' : ''}`}
                      >
                        {selectedGroupMembers.includes(contact.id) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {isGroupMode && (
                <button
                  onClick={() => handleCreateChat()}
                  disabled={!groupName || selectedGroupMembers.length === 0}
                  style={primaryBtn.style}
                  className={`${primaryBtn.className} w-full`}
                >
                  Create Group
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {activeModal === 'addContact' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            style={modalStyle}
            className="w-full max-w-sm flex flex-col animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Add New Contact</h3>
              <button
                onClick={() => setActiveModal('none')}
                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                  <Mail size={18} className="text-[var(--color-info)]" />
                  <span className="text-xs text-[var(--color-text)]">By Email</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                  <PhoneCall size={18} className="text-[var(--color-success)]" />
                  <span className="text-xs text-[var(--color-text)]">By Phone</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveModal('none')}
                  style={primaryBtn.style}
                  className={`${primaryBtn.className} w-full`}
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Meeting Modal */}
      {activeModal === 'newMeeting' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            style={modalStyle}
            className="w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 shrink-0">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Schedule / New Meeting
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              {/* General Settings */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={meetingConfig.title}
                    onChange={(e) => setMeetingConfig({ ...meetingConfig, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                    placeholder="e.g. Q4 Strategy Review"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                      Privacy
                    </label>
                    <div className="grid grid-cols-2 bg-white/5 rounded p-0.5 border border-white/5">
                      <button
                        onClick={() => setMeetingConfig({ ...meetingConfig, privacy: 'private' })}
                        className={`text-xs py-1.5 rounded flex items-center justify-center gap-1 ${meetingConfig.privacy === 'private' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}
                      >
                        <Lock size={12} /> Pvt
                      </button>
                      <button
                        onClick={() => setMeetingConfig({ ...meetingConfig, privacy: 'public' })}
                        className={`text-xs py-1.5 rounded flex items-center justify-center gap-1 ${meetingConfig.privacy === 'public' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}
                      >
                        <Globe size={12} /> Pub
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                      Permissions
                    </label>
                    <select
                      className="w-full px-2 py-2 text-xs outline-none text-[var(--color-text)]"
                      style={modalInputStyle}
                      value={meetingConfig.permissions}
                      onChange={(e) =>
                        setMeetingConfig({ ...meetingConfig, permissions: e.target.value as any })
                      }
                    >
                      <option value="all" style={{ backgroundColor: settings.backgroundColor }}>
                        Everyone can speak
                      </option>
                      <option value="viewers" style={{ backgroundColor: settings.backgroundColor }}>
                        Viewers only
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                    Join Settings
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-[var(--color-text)] cursor-pointer">
                      <input
                        type="radio"
                        checked={meetingConfig.joinType === 'ask'}
                        onChange={() => setMeetingConfig({ ...meetingConfig, joinType: 'ask' })}
                        className="accent-[var(--color-primary)]"
                      />{' '}
                      Ask to Join
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[var(--color-text)] cursor-pointer">
                      <input
                        type="radio"
                        checked={meetingConfig.joinType === 'auto'}
                        onChange={() => setMeetingConfig({ ...meetingConfig, joinType: 'auto' })}
                        className="accent-[var(--color-primary)]"
                      />{' '}
                      Auto Join
                    </label>
                  </div>
                </div>
              </div>

              {/* Schedule Toggle */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[var(--color-info)]" />
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      Schedule for later
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setMeetingConfig({
                        ...meetingConfig,
                        isScheduled: !meetingConfig.isScheduled,
                      })
                    }
                    className={`w-8 h-4 rounded-full relative transition-colors ${meetingConfig.isScheduled ? 'bg-[var(--color-primary)]' : 'bg-slate-700'}`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${meetingConfig.isScheduled ? 'left-4.5 translate-x-0' : 'left-0.5'}`}
                      style={{ left: meetingConfig.isScheduled ? 'calc(100% - 14px)' : '2px' }}
                    />
                  </button>
                </div>

                {meetingConfig.isScheduled && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                          Date
                        </label>
                        <input
                          type="date"
                          value={meetingConfig.date}
                          onChange={(e) =>
                            setMeetingConfig({ ...meetingConfig, date: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded outline-none text-[var(--color-text)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                          Time
                        </label>
                        <input
                          type="time"
                          value={meetingConfig.time}
                          onChange={(e) =>
                            setMeetingConfig({ ...meetingConfig, time: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded outline-none text-[var(--color-text)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                        Waiting Screen Title
                      </label>
                      <input
                        type="text"
                        value={meetingConfig.screenTitle}
                        onChange={(e) =>
                          setMeetingConfig({ ...meetingConfig, screenTitle: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-[var(--color-muted)] uppercase font-bold">
                        Background Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={meetingConfig.bgType}
                          onChange={(e) =>
                            setMeetingConfig({ ...meetingConfig, bgType: e.target.value as any })
                          }
                          className="w-full px-2 py-2 text-xs outline-none text-[var(--color-text)]"
                          style={modalInputStyle}
                        >
                          <option
                            value="procedural"
                            style={{ backgroundColor: settings.backgroundColor }}
                          >
                            Procedural Effect
                          </option>
                          <option
                            value="color"
                            style={{ backgroundColor: settings.backgroundColor }}
                          >
                            Solid Color
                          </option>
                          <option
                            value="image"
                            style={{ backgroundColor: settings.backgroundColor }}
                          >
                            Image URL
                          </option>
                          <option
                            value="video"
                            style={{ backgroundColor: settings.backgroundColor }}
                          >
                            Video URL
                          </option>
                        </select>

                        {meetingConfig.bgType === 'procedural' ? (
                          <select
                            value={meetingConfig.bgValue}
                            onChange={(e) =>
                              setMeetingConfig({ ...meetingConfig, bgValue: e.target.value })
                            }
                            className="w-full px-2 py-2 text-xs outline-none text-[var(--color-text)]"
                            style={modalInputStyle}
                          >
                            <option
                              value="aether"
                              style={{ backgroundColor: settings.backgroundColor }}
                            >
                              Aether Drift
                            </option>
                            <option
                              value="waves"
                              style={{ backgroundColor: settings.backgroundColor }}
                            >
                              Aurora Waves
                            </option>
                            <option
                              value="cosmos"
                              style={{ backgroundColor: settings.backgroundColor }}
                            >
                              Deep Cosmos
                            </option>
                            <option
                              value="net"
                              style={{ backgroundColor: settings.backgroundColor }}
                            >
                              Neural Net
                            </option>
                            <option
                              value="grid"
                              style={{ backgroundColor: settings.backgroundColor }}
                            >
                              Cyber Grid
                            </option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder={
                              meetingConfig.bgType === 'color' ? '#000000' : 'https://...'
                            }
                            value={meetingConfig.bgValue}
                            onChange={(e) =>
                              setMeetingConfig({ ...meetingConfig, bgValue: e.target.value })
                            }
                            className="w-full px-2 py-2 text-xs bg-white/5 border border-white/10 rounded outline-none text-[var(--color-text)]"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => setIsPreviewing(true)}
                        className="w-full mt-2 py-2 rounded border border-dashed border-white/20 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={14} /> Preview Waiting Screen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-lg hover:bg-white/5 text-xs text-[var(--color-text)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartMeeting}
                style={primaryBtn.style}
                className={primaryBtn.className}
              >
                {meetingConfig.isScheduled ? 'Schedule Meeting' : 'Start Instant Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Overlay for Waiting Screen */}
      {isPreviewing && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center animate-in fade-in duration-300">
          {/* Background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundColor: getPreviewBgColor(),
            }}
          >
            {meetingConfig.bgType === 'procedural' && (
              <>
                {meetingConfig.bgValue === 'aether' && <EffectAether />}
                {meetingConfig.bgValue === 'waves' && <EffectWaves />}
                {meetingConfig.bgValue === 'cosmos' && <EffectCosmos />}
                {meetingConfig.bgValue === 'net' && <EffectNet />}
                {meetingConfig.bgValue === 'grid' && <EffectGrid />}
              </>
            )}
            {meetingConfig.bgType === 'color' && (
              <div className="w-full h-full" style={{ backgroundColor: meetingConfig.bgValue }} />
            )}
            {meetingConfig.bgType === 'image' && (
              <img src={meetingConfig.bgValue} alt="bg" className="w-full h-full object-cover" />
            )}
            {meetingConfig.bgType === 'video' && (
              <video
                src={meetingConfig.bgValue}
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Standard overlays */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-lg p-8">
            <h1 className="text-5xl font-extralight text-white tracking-tight">
              {meetingConfig.screenTitle}
            </h1>

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-white/70 uppercase tracking-widest">
                Starts In
              </span>
              <div className="text-4xl font-mono font-bold text-white flex items-center gap-2">
                <span>00</span>
                <span className="text-white/30">:</span>
                <span>14</span>
                <span className="text-white/30">:</span>
                <span>59</span>
              </div>
            </div>

            <div className="pt-8">
              <div className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white flex items-center gap-2">
                <Calendar size={14} />
                <span>
                  {meetingConfig.date} at {meetingConfig.time}
                </span>
              </div>
            </div>
          </div>

          {/* Close Preview Button */}
          <button
            onClick={() => setIsPreviewing(false)}
            className="absolute top-6 right-6 z-20 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-lg text-white text-sm border border-white/10 transition-colors flex items-center gap-2"
          >
            <X size={16} /> Close Preview
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceScreen;
