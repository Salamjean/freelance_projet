import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Send, User, MessageSquare, Search, Paperclip, Smile, X, Check, CheckCheck, Trash2, Reply } from 'lucide-react';
import './chat-interface.css';
import EmojiPicker from 'emoji-picker-react';

interface Message {
  id: number;
  conversationId: number;
  content: string;
  senderId: number;
  createdAt: string;
  isRead: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  sender?: {
    profile?: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
  };
  replyTo?: {
    id: number;
    content: string;
    fileUrl?: string;
    fileName?: string;
    sender?: {
      profile?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };
}

interface Conversation {
  id: number;
  updatedAt: string;
  members: {
    userId: number;
    user: {
      id: number;
      role: string;
      isOnline?: boolean;
      lastSeen?: string;
      profile: {
        firstName: string;
        lastName: string;
        avatarUrl: string;
      };
    };
  }[];
  messages: Message[];
  _count?: {
    messages: number;
  };
}

interface ChatInterfaceProps {
  userId: number;
  userRole: 'CLIENT' | 'FREELANCER';
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId, userRole }) => {
  console.log('User role initialized for chat:', userRole);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstUnreadRef = useRef<HTMLDivElement>(null);
  const [initialUnreadMessageId, setInitialUnreadMessageId] = useState<number | null>(null);
  const hasInitializedScroll = useRef(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (socket && activeConversationId) {
      socket.emit('typing', { conversationId: activeConversationId, senderId: userId, isTyping: true });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId: activeConversationId, senderId: userId, isTyping: false });
      }, 2000);
    }
  };

  // Initialize socket
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      query: { userId: userId.toString() }
    });

    newSocket.on('force_logout', () => {
      localStorage.clear();
      window.location.href = '/login';
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('http://localhost:3000/api/chat/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
      } catch (err) {
        console.error('Erreur chargement conversations', err);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages for active conversation and join socket room
  useEffect(() => {
    if (activeConversationId) {
      hasInitializedScroll.current = false;
      setInitialUnreadMessageId(null);
      setIsOtherUserTyping(false);
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await axios.get(`http://localhost:3000/api/chat/conversations/${activeConversationId}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(res.data);
          
          const unreadMsg = res.data.find((m: Message) => !m.isRead && Number(m.senderId) !== Number(userId));
          setInitialUnreadMessageId(unreadMsg ? unreadMsg.id : null);
          
          // Mark as read
          await axios.put(`http://localhost:3000/api/chat/conversations/${activeConversationId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (socket) {
            socket.emit('messagesRead', { conversationId: activeConversationId, readerId: userId });
          }
        } catch (err) {
          console.error('Erreur chargement messages', err);
        }
      };
      
      fetchMessages();

      if (socket) {
        socket.emit('joinConversation', { conversationId: activeConversationId });
      }
    }
  }, [activeConversationId, socket, userId]);

  // Listen for socket events
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message: Message) => {
        if (message.conversationId === activeConversationId) {
          setMessages(prev => [...prev, message]);
          setIsOtherUserTyping(false); // Reset typing when a message arrives
          
          // Immediate mark as read if conversation is open
          if (Number(message.senderId) !== Number(userId)) {
             const token = localStorage.getItem('accessToken');
             axios.put(`http://localhost:3000/api/chat/conversations/${activeConversationId}/read`, {}, {
               headers: { Authorization: `Bearer ${token}` }
             }).then(() => {
               socket.emit('messagesRead', { conversationId: activeConversationId, readerId: userId });
             }).catch(err => console.error("Could not mark as read", err));
          }
        }
        
        // Update unread count in conversations list
        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === message.conversationId) {
              const isUnread = message.conversationId !== activeConversationId && Number(message.senderId) !== Number(userId);
              return {
                ...conv,
                updatedAt: message.createdAt,
                messages: [message],
                _count: {
                  messages: (conv._count?.messages || 0) + (isUnread ? 1 : 0)
                }
              };
            }
            return conv;
          }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        });
        
        // Dispatch event to update global sidebar navbar
        window.dispatchEvent(new Event('refreshSidebarStats'));
      });

      socket.on('messagesReadByOtherUser', (data: { conversationId: number; readerId: number }) => {
        if (data.conversationId === activeConversationId) {
          setMessages(prev => prev.map(m => {
            if (Number(m.senderId) === Number(userId)) {
              return { ...m, isRead: true };
            }
            return m;
          }));
        }
      });

      socket.on('userTyping', (data: { conversationId: number; senderId: number; isTyping: boolean }) => {
        if (data.conversationId === activeConversationId && Number(data.senderId) !== Number(userId)) {
          setIsOtherUserTyping(data.isTyping);
        }
      });

      socket.on('userStatusChanged', (data: { userId: number; isOnline: boolean; lastSeen?: string }) => {
        console.log('[ChatInterface] Received userStatusChanged:', data);
        setConversations(prev => prev.map(conv => {
          const updatedMembers = conv.members.map(m => {
            if (m.userId === data.userId) {
              return {
                ...m,
                user: {
                  ...m.user,
                  isOnline: data.isOnline,
                  lastSeen: data.lastSeen
                }
              };
            }
            return m;
          });
          return { ...conv, members: updatedMembers };
        }));
      });
      
      return () => {
        socket.off('newMessage');
        socket.off('messagesReadByOtherUser');
        socket.off('userTyping');
        socket.off('userStatusChanged');
      };
    }
  }, [socket, activeConversationId, userId]);

  // Scroll to bottom or first unread
  useEffect(() => {
    if (messages.length === 0) return;

    if (!hasInitializedScroll.current) {
      if (initialUnreadMessageId && firstUnreadRef.current) {
        firstUnreadRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
        hasInitializedScroll.current = true;
      } else if (initialUnreadMessageId === null) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        hasInitializedScroll.current = true;
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, initialUnreadMessageId, isOtherUserTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !activeConversationId || !socket || isUploading) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing', { conversationId: activeConversationId, senderId: userId, isTyping: false });

    let fileUrl;
    let fileName;
    let fileType;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const token = localStorage.getItem('accessToken');
        const res = await axios.post('http://localhost:3000/api/chat/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        });
        fileUrl = res.data.fileUrl;
        fileName = res.data.fileName;
        fileType = res.data.fileType;
      } catch (err: any) {
        console.error('Upload error', err);
        const errorMsg = err.response?.data?.message || '';
        let displayMsg = "Erreur lors de l'envoi du fichier.";
        if (errorMsg === 'File too large' || errorMsg.includes('large')) {
          displayMsg = "Le fichier est trop lourd. Veuillez choisir un fichier plus petit.";
        } else if (errorMsg) {
          displayMsg = errorMsg;
        }
        alert(displayMsg);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    try {
      socket.emit('sendMessage', {
        conversationId: activeConversationId,
        senderId: userId,
        content: newMessage,
        fileUrl,
        fileName,
        fileType,
        replyToId: replyingTo?.id
      });
      setNewMessage('');
      setSelectedFile(null);
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Erreur envoi message', err);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherMember = activeConversation?.members.find(m => m.userId !== userId)?.user;

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.members.find(m => m.userId !== userId)?.user;
    if (!otherUser) return false;
    const fullName = `${otherUser.profile.firstName} ${otherUser.profile.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className={`chat-container ${activeConversationId ? 'chat-active' : ''}`}>
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span>Messages</span>
        </div>
        <div className="chat-sidebar-search">
          <Search size={18} />
          <input 
            type="text" 
            className="chat-search-input" 
            placeholder="Rechercher une conversation..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="conversations-list">
          {filteredConversations.map(conv => {
            const other = conv.members.find(m => m.userId !== userId)?.user;
            if (!other) return null;
            const unreadCount = conv._count?.messages || 0;
            const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
            
            return (
              <div 
                key={conv.id} 
                className={`conversation-item ${activeConversationId === conv.id ? 'active' : ''}`}
                onClick={() => setActiveConversationId(conv.id)}
              >
                <div className="conversation-avatar">
                  {other.profile.avatarUrl ? (
                    <img src={other.profile.avatarUrl} alt={`${other.profile.firstName} ${other.profile.lastName}`} />
                  ) : (
                    <User size={24} />
                  )}
                  {other.isOnline && <div className="online-indicator"></div>}
                </div>
                <div className="conversation-details">
                  <div className="conversation-header-row">
                    <span className="conversation-name">{other.profile.firstName} {other.profile.lastName}</span>
                    <span className="conversation-time">
                      {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div 
                      className="conversation-last-message"
                      style={{ 
                        fontWeight: unreadCount > 0 ? 600 : 'normal', 
                        color: unreadCount > 0 ? '#111827' : '#6b7280' 
                      }}
                    >
                      {lastMessage ? (
                        <>
                          {lastMessage.senderId === userId ? 'Vous: ' : ''}
                          {lastMessage.content ? lastMessage.content : (
                            lastMessage.fileUrl ? (lastMessage.fileType?.startsWith('image/') ? '📷 Image' : (lastMessage.fileType?.startsWith('video/') ? '🎬 Vidéo' : '📎 Fichier')) : ''
                          )}
                        </>
                      ) : (
                        'Nouvelle conversation'
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span className="unread-badge">{unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredConversations.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
              <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>Aucune conversation trouvée</p>
            </div>
          )}
        </div>
      </div>

      {activeConversationId ? (
        <div className="chat-main">
          <div className="chat-header">
            <div className="chat-header-info">
              {otherMember && (
                <>
                  <div className="conversation-avatar">
                    {otherMember.profile.avatarUrl ? (
                      <img src={otherMember.profile.avatarUrl} alt={`${otherMember.profile.firstName} ${otherMember.profile.lastName}`} />
                    ) : (
                      <User size={24} />
                    )}
                    {otherMember.isOnline && <div className="online-indicator"></div>}
                  </div>
                  <div>
                    <h3>{otherMember.profile.firstName} {otherMember.profile.lastName}</h3>
                    <div className="chat-header-status">
                      {otherMember.isOnline ? (
                        <><span className="status-dot online"></span> En ligne</>
                      ) : (
                        <span className="status-offline">
                          Dernière connexion : {otherMember.lastSeen ? new Date(otherMember.lastSeen).toLocaleString() : 'inconnue'}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button 
              className="chat-close-btn" 
              onClick={() => setActiveConversationId(null)}
              title="Fermer la conversation"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => {
              const isMe = Number(msg.senderId) === Number(userId);
              const messageDate = new Date(msg.createdAt);
              
              const previousMsg = index > 0 ? messages[index - 1] : null;
              const previousDate = previousMsg ? new Date(previousMsg.createdAt).toDateString() : null;
              const currentDate = messageDate.toDateString();
              
              const showDateSeparator = currentDate !== previousDate;

              const isFirstUnread = msg.id === initialUnreadMessageId;

              return (
                <React.Fragment key={index}>
                  {showDateSeparator && (
                    <div className="chat-date-separator">
                      {currentDate}
                    </div>
                  )}
                  {isFirstUnread && (
                    <div ref={firstUnreadRef} style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%' }}>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(239, 68, 68, 0.3)' }}></div>
                      <div style={{ padding: '4px 12px', background: '#fee2e2', color: '#ef4444', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', margin: '0 10px' }}>
                        Nouveaux messages
                      </div>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(239, 68, 68, 0.3)' }}></div>
                    </div>
                  )}
                  <div id={`message-${msg.id}`} className={`message-wrapper ${isMe ? 'message-wrapper-sent' : 'message-wrapper-received'}`} style={{
                    display: 'flex',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    marginBottom: '16px',
                    gap: '8px'
                  }}>
                    {!isMe && otherMember && (
                      <div className="message-avatar" style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {otherMember.profile.avatarUrl ? (
                          <img src={otherMember.profile.avatarUrl} alt={`${otherMember.profile.firstName} ${otherMember.profile.lastName}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={16} color="#4b5563" />
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '75%', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && (
                        <span style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', marginLeft: '4px' }}>
                          {msg.sender?.profile?.firstName || otherMember?.profile?.firstName}
                        </span>
                      )}
                      <div className={`message-bubble-container ${isMe ? 'message-sent-container' : 'message-received-container'}`}>
                        <div className={`message-actions ${isMe ? 'actions-left' : 'actions-right'}`}>
                          <button onClick={() => setReplyingTo(msg)} className="message-action-btn" title="Répondre">
                            <Reply size={14} />
                          </button>
                        </div>
                        <div className={`message-bubble ${isMe ? 'message-sent' : 'message-received'}`} style={{ alignSelf: 'auto', maxWidth: '100%' }}>
                          {msg.replyTo && (
                            <div className="message-reply-quote" onClick={() => {
                              const el = document.getElementById(`message-${msg.replyTo?.id}`);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                el.style.background = 'rgba(59, 130, 246, 0.1)';
                                setTimeout(() => el.style.background = 'transparent', 2000);
                              }
                            }}>
                              <div className="reply-sender" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Reply size={12} />
                                <span>En réponse à {msg.replyTo.sender?.profile?.firstName || 'Utilisateur'}</span>
                              </div>
                              <div className="reply-content">
                                {msg.replyTo.content ? msg.replyTo.content.substring(0, 50) + (msg.replyTo.content.length > 50 ? '...' : '') : 'Pièce jointe'}
                              </div>
                            </div>
                          )}
                        {msg.fileUrl && (
                          <div className="message-attachment">
                            {msg.fileType?.startsWith('image/') ? (
                              <img 
                                src={`http://localhost:3000${msg.fileUrl}`} 
                                alt={msg.fileName} 
                                className="chat-image-attachment" 
                                onClick={() => setEnlargedImage(`http://localhost:3000${msg.fileUrl}`)}
                                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              />
                            ) : msg.fileType?.startsWith('video/') ? (
                              <video src={`http://localhost:3000${msg.fileUrl}`} controls className="chat-video-attachment" />
                            ) : (
                              <a href={`http://localhost:3000${msg.fileUrl}`} target="_blank" rel="noopener noreferrer" className="chat-file-attachment">
                                <Paperclip size={16} /> {msg.fileName}
                              </a>
                            )}
                          </div>
                        )}
                        {msg.content && <div className="message-text">{msg.content}</div>}
                        <div className="message-time" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                            <span style={{ marginLeft: '4px', display: 'flex', alignItems: 'center' }}>
                              {msg.isRead ? <CheckCheck size={14} color="#3b82f6" /> : <Check size={14} color="#9ca3af" />}
                            </span>
                          )}
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            
            {isOtherUserTyping && (
              <div className="message-wrapper message-wrapper-received" style={{ display: 'flex', flexDirection: 'row', gap: '8px', marginBottom: '16px' }}>
                <div className="message-bubble message-received" style={{ alignSelf: 'auto', maxWidth: '100%', padding: '12px 18px' }}>
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          {otherMember?.role === 'ADMIN' ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontStyle: 'italic', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
              Vous ne pouvez pas répondre à un message administrateur.
            </div>
          ) : (
            <div className="chat-input-area" style={{ flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
              {selectedFile && (
                <div className="chat-file-preview" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: '8px', alignSelf: 'flex-start' }}>
                  <Paperclip size={16} />
                  <span style={{ fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</span>
                  <button type="button" onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
              {replyingTo && (
                <div className="chat-reply-banner">
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="reply-banner-title">
                      Réponse à {replyingTo.sender?.profile?.firstName || 'Utilisateur'}
                    </div>
                    <div className="reply-banner-content">
                      {replyingTo.content ? replyingTo.content : 'Pièce jointe'}
                    </div>
                  </div>
                  <button type="button" onClick={() => setReplyingTo(null)} className="reply-cancel-btn">
                    <X size={16} />
                  </button>
                </div>
              )}
              <div style={{ position: 'relative', display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                {showEmojiPicker && (
                  <div style={{ position: 'absolute', bottom: 'calc(100% + 10px)', right: '0', zIndex: 50 }}>
                    <EmojiPicker onEmojiClick={(emojiData) => {
                      setNewMessage(prev => prev + emojiData.emoji);
                    }} />
                  </div>
                )}
                <button className="chat-action-btn" title="Joindre un fichier" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <form className="chat-input-wrapper" onSubmit={handleSendMessage} style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f9fafb', borderRadius: '24px', padding: '4px 8px 4px 16px' }}>
                  <input 
                    type="text" 
                    className="chat-input" 
                    placeholder="Écrivez votre message..." 
                    value={newMessage}
                    onChange={handleTyping}
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '8px 0' }}
                  />
                  <button type="button" className="chat-action-btn" title="Ajouter un emoji" style={{ marginRight: '4px' }} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <Smile size={20} />
                  </button>
                  <button type="submit" className="chat-send-btn" disabled={(!newMessage.trim() && !selectedFile) || isUploading} style={{ opacity: isUploading ? 0.5 : 1 }}>
                    {isUploading ? '...' : <Send size={20} />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="chat-empty">
          <div className="chat-empty-icon">
            <MessageSquare size={40} />
          </div>
          <h2>Vos Messages</h2>
          <p>Sélectionnez une conversation dans le menu de gauche pour commencer à discuter.</p>
        </div>
      )}
      
      {enlargedImage && (
        <div 
          className="image-lightbox-overlay"
          onClick={() => setEnlargedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img 
              src={enlargedImage} 
              alt="Aperçu" 
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} 
            />
            <div style={{ position: 'absolute', top: '-40px', right: 0, display: 'flex', gap: '16px' }}>
              <a 
                href={enlargedImage} 
                download 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', transition: 'all 0.2s' }}
              >
                Télécharger
              </a>
              <button 
                onClick={() => setEnlargedImage(null)}
                style={{ border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

