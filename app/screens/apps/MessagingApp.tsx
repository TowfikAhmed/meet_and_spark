import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Check, CheckCheck, Trash2, Ban, Star, UserPlus, Reply, Forward, Plus, X } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface Reaction {
  emoji: string;
  count: number;
  me: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  status: 'sent' | 'delivered' | 'read';
  reactions: Reaction[];
  replyTo?: string; // ID of message being replied to
}

interface Props {
  chatId: string | null;
  chatName: string;
  isGroup: boolean;
  onDeleteChat?: (id: string) => void;
}

const MessagingApp: React.FC<Props> = ({ chatId, chatName, isGroup, onDeleteChat }) => {
  const { settings, hexToRgb } = useTheme();
  const [inputText, setInputText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Common Emojis
  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👀", "🚀", "💯", "👋", "✨"];

  // Reusable Card Style for UI elements
  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(${settings.cardConfig.gradientDirection}deg, rgba(${hexToRgb(settings.cardConfig.gradientStart)}, ${settings.cardConfig.bgOpacity}), rgba(${hexToRgb(settings.cardConfig.gradientEnd)}, ${settings.cardConfig.bgOpacity}))`,
    backdropFilter: `blur(${settings.cardConfig.blur}px)`,
    borderRadius: `${settings.cardConfig.rounded}px`,
    border: settings.cardConfig.hasBorder ? `1px solid ${settings.borderColor}` : 'none',
    boxShadow: settings.cardConfig.hasShadow ? `0 4px 6px -1px ${settings.shadowColor}40` : 'none',
  };

  // Reusable Modal Style for Popups
  const modalStyle: React.CSSProperties = {
    background: `linear-gradient(${settings.modalConfig.gradientDirection}deg, rgba(${hexToRgb(settings.modalConfig.gradientStart)}, ${settings.modalConfig.bgOpacity}), rgba(${hexToRgb(settings.modalConfig.gradientEnd)}, ${settings.modalConfig.bgOpacity}))`,
    backgroundColor: settings.backgroundColor, // fallback
    backdropFilter: `blur(${settings.modalConfig.blur}px)`,
    borderRadius: `${settings.modalConfig.rounded}px`,
    border: settings.modalConfig.hasBorder ? `1px solid ${settings.borderColor}` : 'none',
    boxShadow: settings.modalConfig.hasShadow ? `0 20px 50px -10px ${settings.shadowColor}80` : 'none',
  };

  // Dummy conversation data
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey, did you see the new design updates?', sender: 'them', time: '10:30 AM', status: 'read', reactions: [] },
    { id: '2', text: 'Yes! The procedural background looks amazing.', sender: 'me', time: '10:32 AM', status: 'read', reactions: [{ emoji: '🔥', count: 1, me: false }] },
    { id: '3', text: 'I think we should tweak the gradients slightly.', sender: 'them', time: '10:33 AM', status: 'read', reactions: [] },
    { id: '4', text: 'Agreed. Let\'s discuss in the standup.', sender: 'me', time: '10:35 AM', status: 'delivered', reactions: [{ emoji: '👍', count: 2, me: true }] },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    setIsMenuOpen(false);
    setShowEmojiPicker(false);
    setReplyingTo(null);
  }, [messages, chatId]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      reactions: [],
      replyTo: replyingTo ? replyingTo.id : undefined
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    
    // Simulate reply
    setTimeout(() => {
       setMessages(prev => [...prev, {
         id: (Date.now() + 1).toString(),
         text: `Got it! (Auto-reply from ${chatName})`,
         sender: 'them',
         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         status: 'read',
         reactions: []
       }]);
    }, 2000);
  };

  const handleAddEmojiToInput = (emoji: string) => {
    setInputText(prev => prev + emoji);
    // Don't close picker immediately to allow multiple additions
  };

  const handleMessageReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== msgId) return msg;
      
      const existingReactionIndex = msg.reactions.findIndex(r => r.emoji === emoji);
      let newReactions = [...msg.reactions];

      if (existingReactionIndex >= 0) {
        // Toggle off if I already reacted, or just increment (simulated simple toggle)
        if (newReactions[existingReactionIndex].me) {
           newReactions[existingReactionIndex].count -= 1;
           newReactions[existingReactionIndex].me = false;
        } else {
           newReactions[existingReactionIndex].count += 1;
           newReactions[existingReactionIndex].me = true;
        }
        // Filter out zero counts
        newReactions = newReactions.filter(r => r.count > 0);
      } else {
        newReactions.push({ emoji, count: 1, me: true });
      }

      return { ...msg, reactions: newReactions };
    }));
  };

  if (!chatId) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 opacity-50">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
           <div className="w-12 h-12 border-2 border-[var(--color-primary)] rounded-full animate-pulse"></div>
        </div>
        <h3 className="text-lg font-medium text-[var(--color-text)]">Select a conversation</h3>
        <p className="text-sm text-[var(--color-muted)]">Choose a contact from the sidebar to start messaging.</p>
      </div>
    );
  }

  const bubbleStyle = (sender: 'me' | 'them'): React.CSSProperties => {
    if (sender === 'me') {
      return {
        background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.highlightColor})`,
        color: '#ffffff',
        borderRadius: `${settings.cardConfig.rounded}px ${settings.cardConfig.rounded}px 0 ${settings.cardConfig.rounded}px`,
        boxShadow: `0 2px 8px -2px ${settings.primaryColor}66`,
        padding: `${settings.cardConfig.padding}px`
      };
    }
    // "Them" bubbles use the Card Config style
    return {
      ...cardStyle,
      color: settings.textColor,
      borderRadius: `${settings.cardConfig.rounded}px ${settings.cardConfig.rounded}px ${settings.cardConfig.rounded}px 0`,
      padding: `${settings.cardConfig.padding}px`
    };
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* Chat Header */}
      <div 
        className="flex-none flex items-center justify-between px-4 py-2"
        style={{ 
          borderBottom: `1px solid ${settings.borderColor}`,
          background: `rgba(${hexToRgb(settings.cardConfig.gradientStart)}, ${settings.cardConfig.bgOpacity})`,
          backdropFilter: `blur(${settings.cardConfig.blur}px)`
        }}
      >
        <div className="flex items-center gap-3">
          <div 
             className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-inner"
             style={{ background: `linear-gradient(135deg, ${settings.secondaryColor}, ${settings.mutedColor})`, color: '#fff' }}
          >
            {chatName.charAt(0)}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-text)]">{chatName}</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]"></span>
              <span className="text-[10px] text-[var(--color-muted)]">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 relative">
          <button className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-full transition-colors">
            <Phone size={16} />
          </button>
          <button className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-full transition-colors">
            <Video size={16} />
          </button>
          <div className="w-px h-3 bg-white/10 mx-1"></div>
          <button 
             onClick={() => setIsMenuOpen(!isMenuOpen)}
             className={`p-1.5 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 rounded-full transition-colors ${isMenuOpen ? 'text-[var(--color-text)] bg-white/5' : ''}`}
          >
            <MoreVertical size={16} />
          </button>

          {/* More Dropdown Menu */}
          {isMenuOpen && (
              <div 
                  className="absolute top-full right-0 mt-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden"
                  style={{
                      ...modalStyle,
                      padding: 0
                  }}
              >
                  <div className="p-1 space-y-0.5">
                      {isGroup && (
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-text)] hover:bg-white/5 rounded transition-colors text-left">
                              <UserPlus size={14} className="text-[var(--color-info)]" /> Add Member
                          </button>
                      )}
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-text)] hover:bg-white/5 rounded transition-colors text-left">
                          <Star size={14} className="text-[var(--color-warning)]" /> Favorite
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-text)] hover:bg-white/5 rounded transition-colors text-left">
                          <Ban size={14} className="text-[var(--color-muted)]" /> Block User
                      </button>
                      <div className="h-px bg-white/5 my-1"></div>
                      <button 
                         onClick={() => onDeleteChat && chatId && onDeleteChat(chatId)}
                         className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded transition-colors text-left"
                      >
                          <Trash2 size={14} /> Delete Chat
                      </button>
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-2 duration-300`}
          >
            {/* Replying To Indicator inside bubble area */}
            {msg.replyTo && (
              <div className={`text-[10px] text-[var(--color-muted)] mb-1 opacity-70 flex items-center gap-1 ${msg.sender === 'me' ? 'mr-1' : 'ml-1'}`}>
                <Reply size={10} /> In reply to message
              </div>
            )}

            <div className={`relative max-w-[75%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble */}
              <div 
                className="text-sm relative leading-relaxed group-hover:brightness-95 transition-all"
                style={bubbleStyle(msg.sender)}
              >
                {msg.text}
              </div>

              {/* Action Bar (Hover) */}
              <div className={`absolute top-0 ${msg.sender === 'me' ? '-left-20' : '-right-20'} h-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2`}>
                 <button 
                    onClick={() => handleMessageReaction(msg.id, '❤️')}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[var(--color-muted)] hover:text-pink-400 transition-colors" title="Like"
                 >
                    <Smile size={14} />
                 </button>
                 <button 
                    onClick={() => setReplyingTo(msg)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[var(--color-muted)] hover:text-[var(--color-info)] transition-colors" title="Reply"
                 >
                    <Reply size={14} />
                 </button>
                 <button 
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[var(--color-muted)] hover:text-[var(--color-success)] transition-colors" title="Forward"
                 >
                    <Forward size={14} />
                 </button>
              </div>

              {/* Reactions & Metadata */}
              <div className="flex items-center gap-2 mt-1 px-1">
                {msg.reactions.length > 0 && (
                   <div className="flex gap-1">
                      {msg.reactions.map((r, i) => (
                         <button 
                            key={i} 
                            onClick={() => handleMessageReaction(msg.id, r.emoji)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border border-transparent transition-all hover:scale-105 ${r.me ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30' : 'bg-white/5 text-[var(--color-muted)] hover:bg-white/10'}`}
                         >
                            <span>{r.emoji}</span>
                            {r.count > 1 && <span>{r.count}</span>}
                         </button>
                      ))}
                   </div>
                )}
                
                <div className="flex-1"></div>

                <span className="text-[10px] text-[var(--color-muted)] opacity-70">{msg.time}</span>
                {msg.sender === 'me' && (
                   msg.status === 'read' ? <CheckCheck size={12} className="text-[var(--color-success)]" /> : <Check size={12} className="text-[var(--color-muted)]" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 pt-2 relative z-20">
        
        {/* Replying To Preview */}
        {replyingTo && (
           <div className="flex items-center justify-between px-4 py-2 mb-2 bg-white/5 border border-white/10 rounded-lg text-xs animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-[var(--color-muted)] overflow-hidden">
                 <Reply size={12} />
                 <span className="truncate">Replying to: <span className="text-[var(--color-text)]">{replyingTo.text}</span></span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={12} /></button>
           </div>
        )}

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div 
             ref={pickerRef}
             className="absolute bottom-full left-4 mb-2 z-30 animate-in zoom-in-95 duration-200"
             style={{
               ...modalStyle,
               width: '280px',
               padding: '12px'
             }}
          >
             <div className="grid grid-cols-6 gap-2">
                {commonEmojis.map(emoji => (
                   <button 
                     key={emoji}
                     onClick={() => handleAddEmojiToInput(emoji)}
                     className="p-2 hover:bg-white/10 rounded-md text-xl transition-transform hover:scale-110"
                   >
                      {emoji}
                   </button>
                ))}
             </div>
          </div>
        )}

        <form 
          onSubmit={handleSend}
          className="flex items-center gap-2 transition-all focus-within:ring-1 focus-within:ring-[var(--color-primary)]"
          style={{
            ...cardStyle,
            padding: '8px'
          }}
        >
          <button 
             type="button" 
             className="p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <Paperclip size={18} />
          </button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] h-full"
          />
          
          <button 
             type="button" 
             onClick={() => setShowEmojiPicker(!showEmojiPicker)}
             className={`p-2 transition-colors ${showEmojiPicker ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
          >
            <Smile size={18} />
          </button>

          <button 
             type="submit"
             disabled={!inputText.trim()}
             className="p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             style={{ 
               backgroundColor: settings.primaryColor, 
               color: '#fff',
               boxShadow: `0 2px 10px -2px ${settings.primaryColor}66`,
               borderRadius: `${Math.max(4, settings.cardConfig.rounded - 4)}px`
             }}
          >
            <Send size={16} fill="currentColor" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default MessagingApp;