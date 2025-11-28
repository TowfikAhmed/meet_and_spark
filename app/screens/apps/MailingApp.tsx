import React, { useState, useEffect } from 'react';
import { Star, Reply, Trash2, MoreHorizontal, ArrowLeft, Send, X, Paperclip, Minimize2, Forward, FileText, AlertOctagon, Archive, Inbox as InboxIcon } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  folder: 'Inbox' | 'Sent' | 'Spam' | 'Drafts' | 'Trash';
  labels: string[];
  avatarColor: string;
}

interface Props {
  folder: string;
  isComposing: boolean;
  initialComposeData?: {to: string, subject: string, body: string} | null;
  onReplyForward?: (data: {to: string, subject: string, body: string}) => void;
  onCloseCompose: () => void;
}

const MailingApp: React.FC<Props> = ({ folder, isComposing, initialComposeData, onReplyForward, onCloseCompose }) => {
  const { settings, hexToRgb, getButtonStyles } = useTheme();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // Compose State
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Mock Data State
  const [emails, setEmails] = useState<Email[]>([
    { id: '1', from: 'Design Team', subject: 'Q3 Asset Handoff', preview: 'Here are the final assets for the Q3 campaign...', body: 'Hi Team,\n\nPlease find attached the final assets for the Q3 campaign. We have updated the color palette to match the new procedural system guidelines.\n\nLet us know if you have any feedback before EOD.\n\nBest,\nDesign Team', date: '10:42 AM', read: false, starred: true, folder: 'Inbox', labels: ['Work'], avatarColor: settings.infoColor },
    { id: '2', from: 'HR Department', subject: 'Open Enrollment', preview: 'It is that time of year again! Open enrollment starts...', body: 'Hello Everyone,\n\nIt is that time of year again! Open enrollment starts next Monday. Please review the attached guide for changes to the benefits package.\n\nRegards,\nHR', date: 'Yesterday', read: true, starred: false, folder: 'Inbox', labels: [], avatarColor: settings.warningColor },
    { id: '3', from: 'System Admin', subject: 'Scheduled Maintenance', preview: 'The servers will be down for maintenance on Sunday...', body: 'This is an automated notification.\n\nThe servers will be down for maintenance on Sunday from 2 AM to 4 AM UTC. Please save your work.\n\nSysAdmin', date: 'Oct 24', read: true, starred: false, folder: 'Inbox', labels: [], avatarColor: settings.errorColor },
    { id: '4', from: 'Me', subject: 'Project Proposal', preview: 'Attached is the draft for the new project...', body: 'Hi All,\n\nAttached is the draft. Let me know what you think.', date: 'Oct 20', read: true, starred: false, folder: 'Sent', labels: [], avatarColor: settings.primaryColor },
    { id: '5', from: 'Newsletter', subject: 'Weekly Digest', preview: 'Top stories this week...', body: 'Here are your top stories.', date: 'Oct 19', read: true, starred: false, folder: 'Spam', labels: [], avatarColor: settings.secondaryColor },
    { id: '6', from: 'Me', subject: 'Draft: Q4 Planning', preview: 'Notes for Q4...', body: 'Goal 1: Increase user retention...', date: 'Oct 18', read: true, starred: false, folder: 'Drafts', labels: [], avatarColor: settings.primaryColor },
  ]);

  // Update form when initial data changes (reply/forward)
  useEffect(() => {
    if (isComposing && initialComposeData) {
        setComposeTo(initialComposeData.to);
        setComposeSubject(initialComposeData.subject);
        setComposeBody(initialComposeData.body);
    } else if (isComposing && !initialComposeData) {
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
    }
  }, [isComposing, initialComposeData]);

  const primaryBtn = getButtonStyles('primary');

  // Reusable Card Style for UI elements
  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(${settings.cardConfig.gradientDirection}deg, rgba(${hexToRgb(settings.cardConfig.gradientStart)}, ${settings.cardConfig.bgOpacity}), rgba(${hexToRgb(settings.cardConfig.gradientEnd)}, ${settings.cardConfig.bgOpacity}))`,
    backdropFilter: `blur(${settings.cardConfig.blur}px)`,
    borderRadius: `${settings.cardConfig.rounded}px`,
    border: settings.cardConfig.hasBorder ? `1px solid ${settings.borderColor}` : 'none',
    boxShadow: settings.cardConfig.hasShadow ? `0 4px 6px -1px ${settings.shadowColor}40` : 'none',
  };

  // Reusable Modal Style
  const modalStyle: React.CSSProperties = {
    background: `linear-gradient(${settings.modalConfig.gradientDirection}deg, rgba(${hexToRgb(settings.modalConfig.gradientStart)}, ${settings.modalConfig.bgOpacity}), rgba(${hexToRgb(settings.modalConfig.gradientEnd)}, ${settings.modalConfig.bgOpacity}))`,
    backgroundColor: settings.backgroundColor, // fallback
    backdropFilter: `blur(${settings.modalConfig.blur}px)`,
    borderRadius: `${settings.modalConfig.rounded}px`,
    border: settings.modalConfig.hasBorder ? `1px solid ${settings.borderColor}` : 'none',
    boxShadow: settings.modalConfig.hasShadow ? `0 20px 50px -10px ${settings.shadowColor}80` : 'none',
    padding: '0' 
  };

  const handleReplyClick = () => {
      if (!selectedEmail || !onReplyForward) return;
      onReplyForward({
          to: selectedEmail.from,
          subject: `Re: ${selectedEmail.subject}`,
          body: `\n\n\n> On ${selectedEmail.date}, ${selectedEmail.from} wrote:\n> ${selectedEmail.body.replace(/\n/g, '\n> ')}`
      });
  };

  const handleForwardClick = () => {
    if (!selectedEmail || !onReplyForward) return;
    onReplyForward({
        to: '',
        subject: `Fwd: ${selectedEmail.subject}`,
        body: `\n\n\n---------- Forwarded message ---------\nFrom: ${selectedEmail.from}\nDate: ${selectedEmail.date}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`
    });
  };

  const handleDeleteEmail = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmails(prev => prev.map(email => {
        if (email.id === id) {
            // If already in trash, delete permanently (filter out)
            if (email.folder === 'Trash') return null;
            // Otherwise move to trash
            return { ...email, folder: 'Trash' };
        }
        return email;
    }).filter((e): e is Email => e !== null));
    
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmails(prev => prev.map(email => 
        email.id === id ? { ...email, starred: !email.starred } : email
    ));
    if (selectedEmail?.id === id) {
        setSelectedEmail(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  const handleSaveDraft = () => {
    const newDraft: Email = {
        id: Date.now().toString(),
        from: 'Me',
        subject: composeSubject || '(No Subject)',
        preview: composeBody.substring(0, 50),
        body: composeBody,
        date: 'Draft',
        read: true,
        starred: false,
        folder: 'Drafts',
        labels: [],
        avatarColor: settings.primaryColor
    };
    setEmails([newDraft, ...emails]);
    onCloseCompose();
  };

  // Filter emails based on selected folder/label
  const filteredEmails = emails.filter(email => {
    if (folder === 'Starred') return email.starred && email.folder !== 'Trash'; // Special case for favorites
    if (folder === 'All Mail') return email.folder !== 'Trash' && email.folder !== 'Spam';
    
    // Check if folder matches a label
    const isLabel = !['Inbox', 'Sent', 'Spam', 'Drafts', 'Trash'].includes(folder);
    if (isLabel) return email.labels.includes(folder) && email.folder !== 'Trash';

    return email.folder === folder;
  });

  const renderSingleEmail = () => {
    if (!selectedEmail) return null;
    return (
      <div className="flex flex-col h-full w-full animate-in slide-in-from-right-4 duration-300">
        {/* Toolbar */}
        <div 
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${settings.borderColor}` }}
        >
           <div className="flex items-center gap-2">
             <button 
               onClick={() => setSelectedEmail(null)}
               className="p-2 hover:bg-white/10 rounded-full text-[var(--color-text)] transition-colors"
             >
               <ArrowLeft size={18} />
             </button>
             <div className="h-4 w-px bg-white/10 mx-2"></div>
             <button 
                onClick={() => handleDeleteEmail(selectedEmail.id)}
                className="p-2 hover:bg-white/10 rounded-full text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors"
             >
               <Trash2 size={18} />
             </button>
             <button 
                onClick={() => handleToggleStar(selectedEmail.id)}
                className="p-2 hover:bg-white/10 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
             >
               <Star size={18} fill={selectedEmail.starred ? "currentColor" : "none"} className={selectedEmail.starred ? "text-[var(--color-warning)]" : ""} />
             </button>
             <button className="p-2 hover:bg-white/10 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
               <Archive size={18} />
             </button>
           </div>
           <div className="text-xs text-[var(--color-muted)]">
             {folder} / {selectedEmail.id}
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
           <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex items-start justify-between">
                 <h1 className="text-2xl font-semibold text-[var(--color-text)] leading-snug">{selectedEmail.subject}</h1>
                 {selectedEmail.labels.map(l => (
                     <span key={l} className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-[var(--color-muted)] border border-white/5">{l}</span>
                 ))}
              </div>
              
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
                      style={{ backgroundColor: selectedEmail.avatarColor }}
                    >
                      {selectedEmail.from.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-sm font-medium text-[var(--color-text)]">{selectedEmail.from}</h3>
                       <p className="text-xs text-[var(--color-muted)]">to me</p>
                    </div>
                 </div>
                 <span className="text-xs text-[var(--color-muted)]">{selectedEmail.date}</span>
              </div>

              <div className="prose prose-invert text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap opacity-90">
                 {selectedEmail.body}
              </div>

              <div className="pt-8 border-t border-white/5 flex gap-3">
                 <button 
                   onClick={handleReplyClick}
                   style={primaryBtn.style} 
                   className={primaryBtn.className}
                 >
                   <Reply size={16} /> Reply
                 </button>
                 <button 
                    onClick={handleForwardClick}
                    className="px-6 py-2 rounded-full border border-white/10 text-sm text-[var(--color-text)] hover:bg-white/5 transition-colors flex items-center gap-2"
                 >
                   <Forward size={16} /> Forward
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderEmailList = () => (
    <div className="relative h-full w-full flex flex-col">
       {/* Header */}
       <div 
         className="flex items-center justify-between px-6 py-3 shrink-0"
         style={{ borderBottom: `1px solid ${settings.borderColor}` }}
       >
          <div className="flex items-center gap-2">
             <h2 className="text-base font-medium text-[var(--color-text)] capitalize">{folder}</h2>
             {folder === 'Trash' && <button className="text-[10px] text-[var(--color-error)] hover:underline ml-2">Empty Trash</button>}
          </div>
          <div className="flex gap-2 text-xs text-[var(--color-muted)]">
             <span>{filteredEmails.length} messages</span>
          </div>
       </div>

       {/* Email List */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredEmails.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-[var(--color-muted)] opacity-50">
                <InboxIcon size={48} className="mb-2" />
                <p className="text-sm">No messages in {folder}</p>
             </div>
          )}
          {filteredEmails.map((email) => (
             <div 
               key={email.id}
               onClick={() => setSelectedEmail(email)}
               className={`group flex items-center gap-3 cursor-pointer transition-all duration-200 border border-transparent hover:bg-white/5 px-3 py-2`}
               style={{
                 borderRadius: `${settings.cardConfig.rounded}px`,
                 backgroundColor: email.read ? 'transparent' : 'rgba(255,255,255,0.02)'
               }}
             >
                {/* Checkbox (Visual only) */}
                <div className="w-4 h-4 rounded border border-white/20 flex-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Star */}
                <button 
                    onClick={(e) => handleToggleStar(email.id, e)}
                    className={`flex-none ${email.starred ? 'text-[var(--color-warning)]' : 'text-[var(--color-muted)] opacity-20 group-hover:opacity-100 hover:text-[var(--color-text)]'}`}
                >
                    <Star size={14} fill={email.starred ? "currentColor" : "none"} />
                </button>
                
                {/* From */}
                <div className={`w-32 flex-none truncate text-sm ${!email.read ? 'font-semibold text-[var(--color-text)]' : 'font-normal text-[var(--color-text)] opacity-90'}`}>
                   {email.from}
                </div>
                
                {/* Content Preview */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                   {email.labels.length > 0 && (
                       <div className="flex gap-1 flex-none">
                          {email.labels.map(l => (
                              <span key={l} className="px-1.5 py-0.5 rounded-[2px] text-[9px] border border-white/10 bg-white/5 text-[var(--color-muted)]">{l}</span>
                          ))}
                       </div>
                   )}
                   <div className="truncate text-sm text-[var(--color-muted)]">
                      <span className={`${!email.read ? 'font-semibold text-[var(--color-text)]' : ''}`}>{email.subject}</span>
                      <span className="mx-1 opacity-50">-</span>
                      <span className="opacity-70">{email.preview}</span>
                   </div>
                </div>

                {/* Date & Actions */}
                <div className="flex-none text-xs text-[var(--color-muted)] w-20 text-right group-hover:hidden">
                   {email.date}
                </div>
                <div className="hidden group-hover:flex w-20 justify-end gap-2">
                   <button onClick={(e) => handleDeleteEmail(email.id, e)} className="p-1 hover:text-[var(--color-error)] text-[var(--color-muted)] transition-colors"><Trash2 size={14} /></button>
                   <button className="p-1 hover:text-[var(--color-text)] text-[var(--color-muted)] transition-colors"><Archive size={14} /></button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="relative h-full w-full">
       {/* Main Content (Swaps between List and Detail) */}
       {selectedEmail ? renderSingleEmail() : renderEmailList()}

       {/* Compose Modal (Overlay) */}
       {isComposing && (
         <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
              style={modalStyle}
            >
               <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                  <span className="text-sm font-medium text-[var(--color-text)]">New Message</span>
                  <div className="flex gap-2">
                    <button className="text-[var(--color-muted)] hover:text-[var(--color-text)]"><Minimize2 size={16} /></button>
                    <button onClick={onCloseCompose} className="text-[var(--color-muted)] hover:text-[var(--color-error)]"><X size={16} /></button>
                  </div>
               </div>
               
               <div 
                 className="p-4 space-y-4"
                 style={{ padding: `${settings.modalConfig.padding}px` }}
               >
                  <input 
                    type="text" 
                    placeholder="To" 
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors" 
                  />
                  <input 
                    type="text" 
                    placeholder="Subject" 
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors" 
                  />
                  <textarea 
                    placeholder="Write your message..." 
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full h-48 bg-transparent border-none text-sm text-[var(--color-text)] outline-none resize-none custom-scrollbar" 
                  />
               </div>

               <div className="p-4 border-t border-white/5 flex justify-between items-center" style={{ padding: `${settings.modalConfig.padding}px` }}>
                  <div className="flex gap-2">
                     <button className="p-2 hover:bg-white/5 rounded text-[var(--color-muted)]"><Paperclip size={18} /></button>
                     <button className="p-2 hover:bg-white/5 rounded text-[var(--color-muted)]"><MoreHorizontal size={18} /></button>
                  </div>
                  <div className="flex gap-3">
                     <button 
                        onClick={handleSaveDraft}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 rounded transition-colors"
                     >
                        <FileText size={14} /> Save Draft
                     </button>
                     <button 
                        onClick={onCloseCompose}
                        style={primaryBtn.style} 
                        className={primaryBtn.className}
                     >
                        Send
                     </button>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default MailingApp;