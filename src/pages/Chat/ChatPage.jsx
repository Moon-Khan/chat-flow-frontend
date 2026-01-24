import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messageAPI, authAPI } from '../../services/api';
import {
    ChatContainer,
    Sidebar,
    SidebarHeader,
    UserSection,
    TabsContainer,
    Tab,
    ChatList,
    ChatItem,
    ChatAvatar,
    StatusIndicator,
    ChatInfo,
    ChatName,
    ChatMessage,
    ChatMeta,
    ChatTime,
    ChatHeader,
    ChatArea,
    EmptyState,
    EmptyStateIcon,
    EmptyStateText,
    EmptyStateSubtext,
} from '../../components/Chat';
import { Avatar, Input, Button } from '../../Components/ui';
import { useRef } from 'react';
import { FiSearch, FiMessageSquare, FiUsers, FiSend, FiLogOut, FiPaperclip, FiCamera, FiX, FiTrash2, FiMoreVertical, FiDisc, FiPlus, FiEye, FiSettings } from 'react-icons/fi';
import styled from 'styled-components';

// -----------------------------------------------------------------
// Utilities
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// -----------------------------------------------------------------
const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
};

const formatMessageDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d >= today) return 'Today';
    if (d >= yesterday) return 'Yesterday';

    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
};

// Helper for user info in Sidebar
const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DateSeparator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
    z-index: 1;
  }
  
  span {
    background: ${({ theme }) => theme.colors.background};
    padding: 0.4rem 1rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
    z-index: 2;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const MessageTime = styled.span`
  font-size: 0.7rem;
  color: inherit;
  opacity: 0.8;
  margin-top: 2px;
  align-self: flex-end;
  display: block;
`;

const MessageOptions = styled.div`
  position: absolute;
  top: 50%;
  ${({ $isOwn }) => ($isOwn ? 'left: -35px;' : 'right: -35px;')}
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  padding: 5px;
  color: ${({ theme }) => theme.colors.text.tertiary};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const MessageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
  width: 100%;

  &:hover ${MessageOptions} {
    opacity: 1;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  ${({ $isOwn }) => ($isOwn ? 'right: 0;' : 'left: 0;')}
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 150px;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $danger }) => ($danger ? '#EF4444' : '#374151')};

  &:hover {
    background: #F9FAFB;
  }
`;

const UserStatus = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  input {
    padding-left: 40px;
    width: 100%;
    box-sizing: border-box;
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  gap: 0.5rem;
`;

const MessageBubble = styled.div`
  align-self: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
  background: ${({ $isOwn, theme }) => ($isOwn ? theme.colors.primary[500] : theme.colors.surface)};
  color: ${({ $isOwn, theme }) => ($isOwn ? '#fff' : theme.colors.text.primary)};
  padding: 0.8rem 1.2rem;
  border-radius: 1.2rem;
  border-bottom-right-radius: ${({ $isOwn }) => ($isOwn ? '0.2rem' : '1.2rem')};
  border-bottom-left-radius: ${({ $isOwn }) => ($isOwn ? '1.2rem' : '0.2rem')};
  max-width: 70%;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  line-height: 1.4;
`;

const ChatPage = () => {
    const { user, logout, updateUser } = useContext(AuthContext);
    const { socket, onlineUsers } = useSocket();

    const [activeTab, setActiveTab] = useState('chats');
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');

    // Group state
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [showGroupInfo, setShowGroupInfo] = useState(false);

    // Image/Camera state
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [attachmentCaption, setAttachmentCaption] = useState('');
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [fullscreenImages, setFullscreenImages] = useState([]);
    const [fullscreenIndex, setFullscreenIndex] = useState(0);
    const [activeMessageOptions, setActiveMessageOptions] = useState(null); // { _id, isOwn }

    // Story state
    const [viewingStoryUser, setViewingStoryUser] = useState(null);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

    // Profile State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileMode, setProfileMode] = useState('view'); // 'view' | 'edit'
    const [viewingUser, setViewingUser] = useState(null);
    const [editAbout, setEditAbout] = useState('');
    const [editAvatar, setEditAvatar] = useState(null);
    const avatarInputRef = useRef(null);

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // -----------------------------------------------------------------
    // Data Fetching
    // -----------------------------------------------------------------
    const fetchUsers = async () => {
        try {
            const { data } = await authAPI.getAllUsers();
            setUsers(data);
        } catch (e) {
            console.error('Failed to fetch users', e);
        }
    };

    const fetchConversations = async () => {
        try {
            const { data } = await messageAPI.getConversations();
            setConversations(data);

            // If active chat is open, update it to get latest members/status
            if (activeChat) {
                const refreshed = data.find(c =>
                    (c.type === 'group' && c._id === activeChat._id) ||
                    (c.type === 'private' && c.user._id === (activeChat._id || activeChat.user?._id))
                );
                if (refreshed) setActiveChat(refreshed);
            }
        } catch (e) {
            console.error('Failed to fetch conversations', e);
        }
    };

    const fetchMessages = async (chatTarget) => {
        try {
            let data;
            if (chatTarget.type === 'group' || chatTarget.isGroup) {
                const response = await messageAPI.getChatMessages(chatTarget._id);
                data = response.data;
            } else {
                const response = await messageAPI.getPrivateMessages(chatTarget._id);
                data = response.data;
            }
            setMessages(data);
        } catch (e) {
            console.error('Failed to fetch messages', e);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchConversations();
        console.log("Casing check: components/chat vs components/Chat");
    }, []);

    // -----------------------------------------------------------------
    // Socket Logic
    // -----------------------------------------------------------------
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (newMessage) => {
            // Update Messages if active chat matches
            if (activeChat) {
                const isGroupMsg = !!newMessage.chat;
                const activeIsGroup = activeChat.type === 'group' || activeChat.isGroup;

                if (isGroupMsg && activeIsGroup && String(newMessage.chat) === String(activeChat._id)) {
                    setMessages(prev => [...prev, newMessage]);
                } else if (!isGroupMsg && !activeIsGroup) {
                    const fromId = String(newMessage.from._id || newMessage.from);
                    const toId = String(newMessage.to._id || newMessage.to);
                    const activeId = String(activeChat._id || activeChat.user?._id);
                    if ((fromId === activeId) || (fromId === String(user.id) && toId === activeId)) {
                        setMessages(prev => [...prev, newMessage]);
                    }
                }
            }

            // Refresh Conversations to show latest message preview
            fetchConversations();
        };

        const handleMessageDeleted = (deletedPayload) => {
            const { messageId, isDeletedEveryone, text } = deletedPayload;
            setMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, isDeletedEveryone, text, meta: isDeletedEveryone ? {} : msg.meta }
                    : msg
            ));
            fetchConversations();
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('message_deleted', handleMessageDeleted);
        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_deleted', handleMessageDeleted);
        };
    }, [socket, activeChat, user.id]);

    // -----------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------
    const handleSelectUser = async (selectedUser) => {
        setActiveChat({ ...selectedUser, type: 'private' });
        setShowGroupInfo(false);
        await fetchMessages(selectedUser);
    };

    const handleSelectConversation = async (conv) => {
        setActiveChat(conv);
        setShowGroupInfo(false);
        if (conv.type === 'group') {
            await fetchMessages(conv);
        } else {
            await fetchMessages(conv.user);
        }
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !activeChat || !socket) return;

        const payload = { text: messageInput };
        if (activeChat.type === 'group' || activeChat.isGroup) {
            payload.chat = activeChat._id;
        } else {
            payload.to = activeChat.user?._id || activeChat._id;
        }

        socket.emit('send_message', payload);
        setMessageInput('');
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedParticipants.length === 0) return;
        try {
            await messageAPI.createGroup({
                name: groupName,
                participants: selectedParticipants
            });
            setIsCreatingGroup(false);
            setGroupName('');
            setSelectedParticipants([]);
            fetchConversations();
        } catch (e) {
            console.error('Failed to create group', e);
        }
    };

    const handleLeaveGroup = async () => {
        if (!activeChat || !activeChat.isGroup && activeChat.type !== 'group') return;
        if (!window.confirm(`Are you sure you want to leave ${activeChat.name}?`)) return;

        try {
            await messageAPI.leaveGroup(activeChat._id);
            setActiveChat(null);
            setShowGroupInfo(false);
            fetchConversations();
        } catch (e) {
            console.error('Failed to leave group', e);
        }
    };

    const toggleParticipant = (userId) => {
        setSelectedParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // -----------------------------------------------------------------
    // Image / Camera Handlers
    // -----------------------------------------------------------------
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setPendingFiles(prev => [...prev, ...files]);
        }
    };

    const removePendingFile = (index) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadAndSendAttachments = async () => {
        if (pendingFiles.length === 0) return;
        setUploading(true);
        try {
            const formData = new FormData();
            pendingFiles.forEach(file => {
                formData.append('files', file);
            });

            const { data } = await messageAPI.uploadFiles(formData);
            const files = data.files || [];
            // fallback for backward compatibility if needed, but we rely on files array now
            const urls = data.urls || [data.imageUrl];

            const payload = {
                text: attachmentCaption || (files.length > 0 ? (files.length === 1 ? 'Sent a file' : `Sent ${files.length} files`) : '[Attachment]'),
                meta: {
                    type: 'file',
                    files: files,
                    urls: urls // keep for Image rendering fallback if mixed
                }
            };

            if (activeChat.type === 'group' || activeChat.isGroup) {
                payload.chat = activeChat._id;
            } else {
                payload.to = activeChat.user?._id || activeChat._id;
            }

            socket.emit('send_message', payload);
            setPendingFiles([]);
            setAttachmentCaption('');
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);
            stopCamera();
        }
    };

    const uploadAndSendImage = async (fileOrDataUrl) => {
        setUploading(true);
        try {
            const formData = new FormData();
            if (typeof fileOrDataUrl === 'string') {
                // It's a data URL from camera
                const res = await fetch(fileOrDataUrl);
                const blob = await res.blob();
                formData.append('files', blob, 'camera_photo.jpg');
            } else {
                formData.append('files', fileOrDataUrl);
            }

            const { data } = await messageAPI.uploadFiles(formData);
            const imageUrl = data.imageUrl;

            // Send via socket
            const payload = {
                text: '[Image]',
                meta: { type: 'image', url: imageUrl }
            };

            if (activeChat.type === 'group' || activeChat.isGroup) {
                payload.chat = activeChat._id;
            } else {
                payload.to = activeChat.user?._id || activeChat._id;
            }

            socket.emit('send_message', payload);
            setCapturedImage(null);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const openFullscreen = (urls, index = 0) => {
        setFullscreenImages(urls);
        setFullscreenIndex(index);
        setFullscreenImage(urls[index]);
    };

    const closeFullscreen = () => {
        setFullscreenImage(null);
        setFullscreenImages([]);
        setFullscreenIndex(0);
    };

    const navigateFullscreen = (dir) => {
        const newIndex = (fullscreenIndex + dir + fullscreenImages.length) % fullscreenImages.length;
        setFullscreenIndex(newIndex);
        setFullscreenImage(fullscreenImages[newIndex]);
    };

    const handleDeleteMessage = async (messageId, option) => {
        try {
            await messageAPI.deleteMessage(messageId, option);
            if (option === 'me') {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            } else {
                // 'everyone' - wait for socket or update locally
                setMessages(prev => prev.map(msg =>
                    msg._id === messageId
                        ? { ...msg, isDeletedEveryone: true, text: 'This message was deleted', meta: {} }
                        : msg
                ));
                // Notify via socket so others see it immediately
                socket.emit('delete_message', { messageId, option });
            }
            setActiveMessageOptions(null);
        } catch (err) {
            console.error("Failed to delete message", err);
            alert("Failed to delete message");
        }
    };

    // -----------------------------------------------------------------
    // Filtering
    // -----------------------------------------------------------------
    const filteredConversations = conversations.filter(c => {
        const name = c.type === 'group' ? c.name : c.user?.username;
        return name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );



    return (
        <ChatContainer>
            {/* Sidebar */}
            <Sidebar>
                <SidebarHeader>

                    <UserSection>
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, cursor: 'pointer' }}
                            onClick={() => {
                                setViewingUser(user);
                                setProfileMode('edit');
                                setEditAbout(user.about || '');
                                setShowProfileModal(true);
                            }}
                        >
                            <Avatar>
                                {user?.avatarUrl ? (
                                    <img
                                        src={`${BACKEND_URL}${user.avatarUrl}`}
                                        alt="me"
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user?.username?.[0]?.toUpperCase() || 'U'
                                )}
                            </Avatar>
                            <UserInfo>
                                <UserName>{user?.username || 'User'}</UserName>
                                <UserStatus>🟢 Online</UserStatus>
                            </UserInfo>
                        </div>
                        <Button
                            $variant="ghost"
                            $size="sm"
                            onClick={logout}
                            title="Logout"
                            style={{ padding: '8px', minWidth: 'auto' }}
                        >
                            <FiLogOut size={18} />
                        </Button>
                    </UserSection>

                    <TabsContainer>
                        <Tab $active={activeTab === 'chats'} onClick={() => setActiveTab('chats')}>
                            <FiMessageSquare size={16} style={{ marginRight: '0.5rem' }} />
                            Chats
                        </Tab>
                        <Tab $active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsCreatingGroup(false); }}>
                            <FiUsers size={16} style={{ marginRight: '0.5rem' }} />
                            Users
                        </Tab>
                    </TabsContainer>

                    <SearchContainer>
                        <FiSearch size={18} />
                        <Input
                            placeholder={`Search ${activeTab === 'chats' ? 'chats' : 'users'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchContainer>

                    {activeTab === 'chats' && !isCreatingGroup && (
                        <Button $fullWidth $variant="secondary" onClick={() => setIsCreatingGroup(true)} style={{ marginBottom: '1rem' }}>
                            <FiUsers size={16} style={{ marginRight: '0.5rem' }} />
                            New Group
                        </Button>
                    )}
                </SidebarHeader>

                <ChatList>
                    {isCreatingGroup ? (
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Group Name</div>
                                <Input
                                    placeholder="Enter group name..."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>

                            <div>
                                <div style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                                    Select Participants ({selectedParticipants.length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                    {users.filter(u => u._id !== user.id).map(u => (
                                        <div
                                            key={u._id}
                                            onClick={() => toggleParticipant(u._id)}
                                            style={{
                                                padding: '0.75rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                background: selectedParticipants.includes(u._id) ? '#F3F4F6' : 'white',
                                                border: '1px solid',
                                                borderColor: selectedParticipants.includes(u._id) ? '#3B82F6' : '#E5E7EB',
                                                borderRadius: '0.75rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedParticipants.includes(u._id)}
                                                readOnly
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <Avatar size="sm">{u.username?.[0]?.toUpperCase()}</Avatar>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{u.username}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                <Button
                                    $fullWidth
                                    onClick={handleCreateGroup}
                                    disabled={!groupName.trim() || selectedParticipants.length === 0}
                                >
                                    Create Group
                                </Button>
                                <Button
                                    $fullWidth
                                    $variant="secondary"
                                    onClick={() => {
                                        setIsCreatingGroup(false);
                                        setGroupName('');
                                        setSelectedParticipants([]);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        activeTab === 'chats' ? (
                            filteredConversations.map((chat, idx) => {
                                const isGroup = chat.type === 'group';
                                const displayName = isGroup ? chat.name : chat.user.username;
                                const displayId = isGroup ? chat._id : chat.user._id;
                                const avatarUrl = isGroup ? chat.avatarUrl : chat.user.avatarUrl;

                                return (
                                    <ChatItem key={displayId + idx} onClick={() => handleSelectConversation(chat)} $active={activeChat?._id === displayId}>
                                        <ChatAvatar>
                                            {avatarUrl ? (
                                                <img
                                                    src={`${BACKEND_URL}${avatarUrl}`}
                                                    alt={displayName}
                                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                displayName[0].toUpperCase()
                                            )}
                                            {!isGroup && <StatusIndicator $online={onlineUsers?.has(chat.user._id)} />}
                                        </ChatAvatar>
                                        <ChatInfo>
                                            <ChatName>{displayName} {isGroup && <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 400 }}>(Group)</span>}</ChatName>
                                            <ChatMessage>
                                                {chat.lastMessage?.isOwn ? 'You: ' : ''}
                                                {chat.lastMessage?.text || 'No messages yet'}
                                            </ChatMessage>
                                        </ChatInfo>
                                        {chat.lastMessage && (
                                            <ChatMeta>
                                                <ChatTime>
                                                    {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </ChatTime>
                                            </ChatMeta>
                                        )}
                                    </ChatItem>
                                );
                            })
                        ) : (
                            filteredUsers.map((u) => (
                                <ChatItem key={u._id} onClick={() => handleSelectUser(u)} $active={activeChat?._id === u._id}>
                                    <ChatAvatar>
                                        {u.avatarUrl ? (
                                            <img
                                                src={`${BACKEND_URL}${u.avatarUrl}`}
                                                alt={u.username}
                                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            u.username[0].toUpperCase()
                                        )}
                                        <StatusIndicator $online={onlineUsers?.has(u._id)} />
                                    </ChatAvatar>
                                    <ChatInfo>
                                        <ChatName>{u.username}</ChatName>
                                        <ChatMessage>{u.email}</ChatMessage>
                                    </ChatInfo>
                                </ChatItem>
                            ))
                        )
                    )}</ChatList>

            </Sidebar >

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {
                    activeChat ? (
                        <>
                            <ChatHeader
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    if (activeChat.type === 'group' || activeChat.isGroup) {
                                        setShowGroupInfo(!showGroupInfo);
                                    } else {
                                        /* Handle User Profile View */
                                        setViewingUser(activeChat.user || activeChat);
                                        setProfileMode('view');
                                        setShowProfileModal(true);
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Avatar>
                                        {((activeChat.avatarUrl || activeChat.user?.avatarUrl)) ? (
                                            <img
                                                src={`${BACKEND_URL}${activeChat.avatarUrl || activeChat.user?.avatarUrl}`}
                                                alt="avatar"
                                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            (activeChat.name || activeChat.username || activeChat.user?.username)?.[0]?.toUpperCase()
                                        )}
                                    </Avatar>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{activeChat.name || activeChat.username || activeChat.user?.username}</div>
                                        <div style={{ fontSize: '0.85rem', color: (activeChat.type === 'group' || activeChat.isGroup) ? '#6B7280' : (onlineUsers?.has(activeChat._id || activeChat.user?._id) ? '#10B981' : '#6B7280') }}>
                                            {(activeChat.type === 'group' || activeChat.isGroup) ? `${activeChat.participants?.length || 0} members - Click for info` : (onlineUsers?.has(activeChat._id || activeChat.user?._id) ? 'Online' : 'Offline')}
                                        </div>
                                    </div>
                                </div>
                            </ChatHeader>

                            {
                                showGroupInfo && (activeChat.type === 'group' || activeChat.isGroup) && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '70px',
                                        right: '20px',
                                        width: '300px',
                                        background: 'white',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        borderRadius: '1rem',
                                        zIndex: 10,
                                        border: '1px solid #E5E7EB',
                                        padding: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
                                            Group Members
                                        </div>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {activeChat.participants?.map(p => (
                                                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <Avatar size="sm">{p.username?.[0]?.toUpperCase()}</Avatar>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{p.username} {p._id === activeChat.admin && <span style={{ fontSize: '0.7rem', color: '#3B82F6' }}>(Admin)</span>}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{p.email}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button $variant="secondary" $fullWidth onClick={handleLeaveGroup} style={{ color: '#EF4444', borderColor: '#FCA5A5', marginTop: '0.5rem' }}>
                                            Leave Group
                                        </Button>
                                    </div>
                                )
                            }

                            <ChatArea onClick={() => { setShowGroupInfo(false); setActiveMessageOptions(null); }}>
                                {(() => {
                                    let lastDate = null;
                                    return messages.map((msg, index) => {
                                        const isOwn = (msg.from._id || msg.from) === user.id;
                                        const fromName = msg.from.username || 'User';
                                        const isImage = msg.meta && msg.meta.type === 'image';
                                        const imageUrls = msg.meta?.urls || (msg.meta?.url ? [msg.meta.url] : []);

                                        const msgDate = formatMessageDate(msg.createdAt);
                                        const showDateSeparator = msgDate !== lastDate;
                                        lastDate = msgDate;

                                        return (
                                            <React.Fragment key={msg._id || index}>
                                                {showDateSeparator && (
                                                    <DateSeparator>
                                                        <span>{msgDate}</span>
                                                    </DateSeparator>
                                                )}
                                                <MessageWrapper $isOwn={isOwn}>
                                                    {!isOwn && (activeChat.type === 'group' || activeChat.isGroup) && (
                                                        <div style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0.5rem 0.2rem' }}>{fromName}</div>
                                                    )}
                                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '70%', alignSelf: isOwn ? 'flex-end' : 'flex-start' }}>
                                                        <MessageBubble
                                                            $isOwn={isOwn}
                                                            style={{
                                                                padding: '8px',
                                                                background: isOwn ? 'rgba(59, 130, 246, 0.05)' : 'white',
                                                                border: '1px solid #E5E7EB',
                                                                color: msg.isDeletedEveryone ? '#9CA3AF' : '#1F2937',
                                                                maxWidth: '100%',
                                                                fontStyle: msg.isDeletedEveryone ? 'italic' : 'normal'
                                                            }}
                                                        >
                                                            {msg.meta && (msg.meta.type === 'image' || msg.meta.type === 'file') && !msg.isDeletedEveryone ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                    {/* Handle Images */}
                                                                    {(() => {
                                                                        const files = msg.meta.files || [];
                                                                        const validImages = files.filter(f => f.mimetype && f.mimetype.startsWith('image/'))
                                                                            .map(f => f.url);
                                                                        // Fallback to urls array if files meta not present (backward compatibility)
                                                                        const fallbackImages = files.length === 0 ? (msg.meta.urls || (msg.meta.url ? [msg.meta.url] : [])) : [];
                                                                        const imagesToShow = [...validImages, ...fallbackImages];

                                                                        if (imagesToShow.length > 0) {
                                                                            return (
                                                                                <div style={{
                                                                                    display: 'grid',
                                                                                    gridTemplateColumns: imagesToShow.length > 1 ? 'repeat(2, 1fr)' : '1fr',
                                                                                    gap: '4px'
                                                                                }}>
                                                                                    {imagesToShow.map((url, idx) => (
                                                                                        <img
                                                                                            key={idx}
                                                                                            src={`${BACKEND_URL}${url}`}
                                                                                            alt="sent"
                                                                                            onClick={() => openFullscreen(imagesToShow.map(u => `${BACKEND_URL}${u}`), idx)}
                                                                                            style={{
                                                                                                width: '100%',
                                                                                                height: imagesToShow.length > 1 ? '120px' : 'auto',
                                                                                                maxHeight: '300px',
                                                                                                borderRadius: '0.4rem',
                                                                                                display: 'block',
                                                                                                objectFit: 'cover',
                                                                                                cursor: 'pointer',
                                                                                                transition: 'opacity 0.2s'
                                                                                            }}
                                                                                            onMouseOver={(e) => e.target.style.opacity = '0.9'}
                                                                                            onMouseOut={(e) => e.target.style.opacity = '1'}
                                                                                            onError={(e) => {
                                                                                                e.target.onerror = null;
                                                                                                e.target.src = 'https://via.placeholder.com/150?text=Image+Load+Error';
                                                                                            }}
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    })()}

                                                                    {/* Handle Non-Image Files */}
                                                                    {msg.meta.files && msg.meta.files.filter(f => !f.mimetype || !f.mimetype.startsWith('image/')).map((file, idx) => (
                                                                        <div key={idx} style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '10px',
                                                                            padding: '10px',
                                                                            background: '#F3F4F6',
                                                                            borderRadius: '8px',
                                                                            border: '1px solid #E5E7EB',
                                                                            marginTop: idx > 0 ? '4px' : '0'
                                                                        }}>
                                                                            <div style={{
                                                                                width: '40px',
                                                                                height: '40px',
                                                                                background: '#E0E7FF',
                                                                                color: '#4F46E5',
                                                                                borderRadius: '8px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                fontSize: '1.2rem',
                                                                                fontWeight: 'bold'
                                                                            }}>
                                                                                {file.filename.split('.').pop().toUpperCase()}
                                                                            </div>
                                                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                                                <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.filename}</div>
                                                                                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                                                                    {file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'File'}
                                                                                </div>
                                                                            </div>
                                                                            <a
                                                                                href={`${BACKEND_URL}${file.url}`}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                download
                                                                                style={{
                                                                                    padding: '6px 12px',
                                                                                    background: 'white',
                                                                                    border: '1px solid #E5E7EB',
                                                                                    borderRadius: '6px',
                                                                                    color: '#374151',
                                                                                    textDecoration: 'none',
                                                                                    fontSize: '0.8rem',
                                                                                    fontWeight: 500
                                                                                }}
                                                                            >
                                                                                Open
                                                                            </a>
                                                                        </div>
                                                                    ))}

                                                                    {msg.text && msg.text !== '[Image]' && msg.text !== '[Attachment]' && (
                                                                        <div style={{ padding: '4px 2px', fontSize: '0.9rem' }}>{msg.text}</div>
                                                                    )}
                                                                </div>
                                                            ) : msg.text}

                                                            <MessageTime $isOwn={isOwn}>
                                                                {formatMessageTime(msg.createdAt)}
                                                            </MessageTime>
                                                        </MessageBubble>

                                                        {!msg.isDeletedEveryone && (
                                                            <MessageOptions
                                                                $isOwn={isOwn}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMessageOptions(activeMessageOptions?._id === msg._id ? null : { _id: msg._id, isOwn });
                                                                }}
                                                            >
                                                                <FiMoreVertical size={16} />
                                                            </MessageOptions>
                                                        )}

                                                        {activeMessageOptions && msg._id && activeMessageOptions._id === msg._id && (
                                                            <DropdownMenu $isOwn={isOwn} onClick={(e) => e.stopPropagation()}>
                                                                <DropdownItem onClick={() => handleDeleteMessage(msg._id, 'me')}>
                                                                    <FiTrash2 size={14} /> Delete for me
                                                                </DropdownItem>
                                                                {isOwn && (
                                                                    <DropdownItem $danger onClick={() => handleDeleteMessage(msg._id, 'everyone')}>
                                                                        <FiTrash2 size={14} /> Delete for everyone
                                                                    </DropdownItem>
                                                                )}
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                </MessageWrapper>
                                            </React.Fragment>
                                        );
                                    });
                                })()}
                            </ChatArea>

                            {/* Fullscreen Lightbox Overlay */}
                            {
                                fullscreenImage && (
                                    <div style={{
                                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                                    }} onClick={closeFullscreen}>
                                        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                            <Button $variant="ghost" onClick={closeFullscreen} style={{ color: 'white', padding: '10px' }}>
                                                <FiX size={32} />
                                            </Button>
                                        </div>

                                        {fullscreenImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigateFullscreen(-1); }}
                                                    style={{
                                                        position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none',
                                                        color: 'white', cursor: 'pointer', fontSize: '2rem', borderRadius: '50%', width: '50px', height: '50px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    ‹
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigateFullscreen(1); }}
                                                    style={{
                                                        position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none',
                                                        color: 'white', cursor: 'pointer', fontSize: '2rem', borderRadius: '50%', width: '50px', height: '50px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    ›
                                                </button>
                                            </>
                                        )}

                                        <img src={fullscreenImage} alt="fullscreen" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} onClick={(e) => e.stopPropagation()} />

                                        <div style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', background: 'rgba(0,0,0,0.5)', padding: '5px 12px', borderRadius: '20px' }}>
                                            {fullscreenIndex + 1} / {fullscreenImages.length}
                                        </div>
                                    </div>
                                )
                            }

                            {/* Attachments Preview Modal */}
                            {
                                pendingFiles.length > 0 && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(243, 244, 246, 0.9)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '2rem'
                                    }}>
                                        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ margin: 0 }}>Send {pendingFiles.length} Images</h3>
                                                <FiX size={24} cursor="pointer" onClick={() => setPendingFiles([])} />
                                            </div>

                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(3, 1fr)',
                                                gap: '8px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                padding: '4px',
                                                background: '#F9FAFB',
                                                borderRadius: '0.5rem'
                                            }}>
                                                {pendingFiles.map((file, idx) => {
                                                    const isImage = file.type.startsWith('image/');
                                                    return (
                                                        <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', background: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                            {isImage ? (
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt="preview"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                                                                    <div style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>📄</div>
                                                                    <div style={{ fontSize: '0.7rem', wordBreak: 'break-all', maxHeight: '2.4em', overflow: 'hidden' }}>{file.name}</div>
                                                                </div>
                                                            )}
                                                            <div
                                                                onClick={() => removePendingFile(idx)}
                                                                style={{ position: 'absolute', top: '4px', right: '4px', background: '#EF4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                                                            >
                                                                <FiX size={12} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <Input
                                                placeholder="Add a caption..."
                                                value={attachmentCaption}
                                                onChange={(e) => setAttachmentCaption(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && uploadAndSendAttachments()}
                                            />

                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                                <Button $variant="secondary" onClick={() => setPendingFiles([])}>Cancel</Button>
                                                <Button onClick={uploadAndSendAttachments} disabled={uploading}>
                                                    {uploading ? 'Uploading...' : 'Send'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* Camera Overlay */}
                            {
                                isCameraOpen && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100
                                    }}>
                                        <video ref={videoRef} autoPlay playsInline style={{ maxWidth: '90%', maxHeight: '70%', borderRadius: '1rem' }} />
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                            <Button onClick={capturePhoto}>Capture</Button>
                                            <Button $variant="secondary" onClick={stopCamera}>Cancel</Button>
                                        </div>
                                    </div>
                                )
                            }

                            {/* Captured Preview Overlay */}
                            {
                                capturedImage && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100
                                    }}>
                                        <img src={capturedImage} alt="preview" style={{ maxWidth: '90%', maxHeight: '70%', borderRadius: '1rem' }} />
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                            <Button onClick={() => uploadAndSendImage(capturedImage)} disabled={uploading}>
                                                {uploading ? 'Sending...' : 'Send Photo'}
                                            </Button>
                                            <Button $variant="secondary" onClick={() => setCapturedImage(null)}>Discard</Button>
                                        </div>
                                    </div>
                                )
                            }

                            <canvas ref={canvasRef} style={{ display: 'none' }} />

                            <InputContainer>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    multiple
                                    onChange={handleFileChange}
                                />
                                <Button $variant="ghost" onClick={() => fileInputRef.current.click()} style={{ padding: '8px' }}>
                                    <FiPaperclip size={20} />
                                </Button>
                                <Button $variant="ghost" onClick={startCamera} style={{ padding: '8px' }}>
                                    <FiCamera size={20} />
                                </Button>
                                <Input
                                    placeholder="Type your message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button onClick={handleSendMessage}>
                                    <FiSend size={18} />
                                </Button>
                            </InputContainer>
                        </>
                    ) : (
                        <EmptyState>
                            <EmptyStateIcon>
                                <FiMessageSquare size={64} />
                            </EmptyStateIcon>
                            <EmptyStateText>Welcome to ChatFlow</EmptyStateText>
                            <EmptyStateSubtext>
                                Select a user or conversation from the sidebar to start messaging.
                            </EmptyStateSubtext>
                        </EmptyState>
                    )}

            </div >

            {
                showProfileModal && viewingUser && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} onClick={() => setShowProfileModal(false)}>
                        <div style={{
                            background: 'white', padding: '2rem', borderRadius: '1rem', width: '400px', maxWidth: '90%',
                            position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }} onClick={e => e.stopPropagation()}>

                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer' }} onClick={() => setShowProfileModal(false)}>
                                <FiX size={24} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden',
                                        background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2.5rem', color: '#4F46E5', fontWeight: 'bold'
                                    }}>
                                        {profileMode === 'edit' && editAvatar ? (
                                            <img src={URL.createObjectURL(editAvatar)} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            viewingUser.avatarUrl ? (
                                                <img src={`${BACKEND_URL}${viewingUser.avatarUrl}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                viewingUser.username?.[0]?.toUpperCase()
                                            )
                                        )}
                                    </div>
                                    {profileMode === 'edit' && (
                                        <div
                                            style={{
                                                position: 'absolute', bottom: 0, right: 0, background: '#3B82F6', color: 'white',
                                                borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', cursor: 'pointer', border: '2px solid white'
                                            }}
                                            onClick={() => avatarInputRef.current.click()}
                                        >
                                            <FiCamera size={16} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={(e) => setEditAvatar(e.target.files[0])}
                                    />
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937' }}>{viewingUser.username}</div>
                                    <div style={{ color: '#6B7280' }}>{viewingUser.email}</div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>About</div>
                                {profileMode === 'edit' ? (
                                    <textarea
                                        value={editAbout}
                                        onChange={(e) => setEditAbout(e.target.value)}
                                        rows={4}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB',
                                            fontFamily: 'inherit', resize: 'none'
                                        }}
                                        placeholder="Write something about yourself..."
                                    />
                                ) : (
                                    <div style={{
                                        padding: '1rem', background: '#F9FAFB', borderRadius: '0.5rem', color: '#4B5563',
                                        fontStyle: viewingUser.about ? 'normal' : 'italic', minHeight: '80px'
                                    }}>
                                        {viewingUser.about || "No about info set."}
                                    </div>
                                )}
                            </div>



                            {profileMode === 'edit' && (
                                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                                    <Button $variant="secondary" $fullWidth onClick={() => {
                                        setEditAbout(user.about || '');
                                        setEditAvatar(null);
                                        setProfileMode('view');
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button $fullWidth
                                        onClick={async () => {
                                            try {
                                                setUploading(true);
                                                let avatarUrl = user.avatarUrl;

                                                if (editAvatar) {
                                                    const formData = new FormData();
                                                    formData.append('files', editAvatar);
                                                    const { data } = await messageAPI.uploadFiles(formData);
                                                    avatarUrl = data.files?.[0]?.url || data.imageUrl || data.urls?.[0]; // robust fallback
                                                }

                                                const response = await authAPI.updateProfile({
                                                    about: editAbout,
                                                    avatarUrl
                                                });
                                                const updatedUser = response.data.user;

                                                // Update context and local storage so reload picks up new data
                                                if (updateUser) {
                                                    updateUser(updatedUser);
                                                } else {
                                                    // Fallback if updateUser not yet available in context (should be there though)
                                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                                }

                                                // alert("Profile updated! Please refresh to see changes everywhere.");
                                                window.location.reload(); // Auto-refresh to ensure context updates
                                                // setShowProfileModal(false);
                                            } catch (e) {
                                                console.error(e);
                                                alert("Failed to update profile");
                                            } finally {
                                                setUploading(false);
                                            }
                                        }}
                                        disabled={uploading}
                                    >
                                        {uploading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Story Viewer Overlay */}
            {
                viewingStoryUser && viewingStoryUser.stories && viewingStoryUser.stories.length > 0 && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'black', zIndex: 2000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} onClick={() => setViewingStoryUser(null)}>
                        <div style={{
                            width: '100%', maxWidth: '400px', height: '90vh', position: 'relative',
                            display: 'flex', flexDirection: 'column',
                            background: '#111'
                        }} onClick={e => e.stopPropagation()}>

                            {/* Progress Bar */}
                            <div style={{ display: 'flex', gap: '4px', padding: '10px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                                {viewingStoryUser.stories.map((s, idx) => (
                                    <div key={idx} style={{ flex: 1, height: '3px', background: idx === activeStoryIndex ? 'white' : 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
                                ))}
                            </div>

                            {/* Navigation Areas */}
                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', zIndex: 5 }} onClick={() => {
                                if (activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1);
                            }}></div>
                            <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '30%', zIndex: 5 }} onClick={() => {
                                if (activeStoryIndex < viewingStoryUser.stories.length - 1) {
                                    setActiveStoryIndex(activeStoryIndex + 1);
                                } else {
                                    setViewingStoryUser(null); // Close on last story next
                                }
                            }}></div>

                            {/* Content */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {(() => {
                                    const currentStory = viewingStoryUser.stories[activeStoryIndex];
                                    if (!currentStory) return null;
                                    return currentStory.mediaType === 'video' ? (
                                        <video
                                            src={`${BACKEND_URL}${currentStory.mediaUrl}`}
                                            autoPlay
                                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                                        />
                                    ) : (
                                        <img
                                            src={`${BACKEND_URL}${currentStory.mediaUrl}`}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    );
                                })()}
                            </div>

                            {/* User Info */}
                            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                                <Avatar size="sm">{viewingStoryUser.user.avatarUrl ? <img src={`${BACKEND_URL}${viewingStoryUser.user.avatarUrl}`} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : viewingStoryUser.user.username[0]}</Avatar>
                                <span style={{ color: 'white', fontWeight: 600 }}>{viewingStoryUser.user.username}</span>
                            </div>
                        </div>
                    </div>
                )
            }
        </ChatContainer >
    );
};

export default ChatPage;
