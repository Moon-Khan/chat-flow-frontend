import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messageAPI, authAPI, storyAPI } from '../../services/api';
import {
    ChatContainer,
    Sidebar,
    SidebarHeader,
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
    NavSidebar,
    EmptyState,
    EmptyStateIcon,
    EmptyStateText,
    EmptyStateSubtext,
} from '../../Components/chat';
import { Avatar, Input, Button, AlertModal, Modal, ConfirmModal } from '../../Components/ui';
import { useRef } from 'react';
import { FiSearch, FiMessageSquare, FiUsers, FiSend, FiLogOut, FiPaperclip, FiCamera, FiX, FiTrash2, FiMoreVertical, FiDisc, FiPlus, FiEye, FiSettings, FiGrid, FiLayers } from 'react-icons/fi';
import styled, { useTheme } from 'styled-components';

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
    const theme = useTheme();
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
    const [allStories, setAllStories] = useState([]);
    const [viewingStoryUser, setViewingStoryUser] = useState(null);
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [pendingStoryFiles, setPendingStoryFiles] = useState([]);
    const [showStoryPrivacyModal, setShowStoryPrivacyModal] = useState(false);
    const [storyUploadConfigs, setStoryUploadConfigs] = useState([]); // Array of { file, privacy, allowedUsers }
    const [showViewersList, setShowViewersList] = useState(false);

    // Profile State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileMode, setProfileMode] = useState('view'); // 'view' | 'edit'
    const [settingsTab, setSettingsTab] = useState('profile'); // 'profile' | 'security'
    const [viewingUser, setViewingUser] = useState(null);
    const [editAbout, setEditAbout] = useState('');
    const [editAvatar, setEditAvatar] = useState(null);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [storyPrivacy, setStoryPrivacy] = useState(user?.storyPrivacy || 'everyone');
    const [storyAllowedUsers, setStoryAllowedUsers] = useState(user?.storyAllowedUsers || []);
    const [statusPrivacy, setStatusPrivacy] = useState(user?.statusPrivacy || 'everyone');
    const [statusAllowedUsers, setStatusAllowedUsers] = useState(user?.statusAllowedUsers || []);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, type: 'danger' });

    const showAlert = (title, message, type = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    const showConfirm = (title, message, onConfirm, type = 'danger') => {
        setConfirmConfig({ isOpen: true, title, message, onConfirm, type });
    };

    const avatarInputRef = useRef(null);

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const messagesEndRef = useRef(null);

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
            // Sort conversations by latest message date
            const sortedConversations = [...data].sort((a, b) => {
                const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(a.createdAt || 0);
                const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            setConversations(sortedConversations);

            // If active chat is open, update it to get latest members/status
            if (activeChat) {
                const refreshed = sortedConversations.find(c =>
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

    const fetchStories = async () => {
        try {
            const { data } = await storyAPI.getStories();
            // Sort stories: current user's story first, then others
            const sortedStories = [...data].sort((a, b) => {
                if (String(a.user._id) === String(user.id)) return -1;
                if (String(b.user._id) === String(user.id)) return 1;
                return 0;
            });
            setAllStories(sortedStories);
        } catch (e) {
            console.error('Failed to fetch stories', e);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchConversations();
        fetchStories();
    }, []);

    // Mark story as viewed when active
    useEffect(() => {
        if (!viewingStoryUser || !viewingStoryUser.stories) return;
        const currentStory = viewingStoryUser.stories[activeStoryIndex];
        if (currentStory && String(viewingStoryUser.user._id) !== String(user.id)) {
            storyAPI.viewStory(currentStory._id).catch(err => console.error("Failed to mark story as viewed", err));
        }
    }, [viewingStoryUser, activeStoryIndex, user.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeChat]);

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
        setShowMobileChat(true);
        await fetchMessages(selectedUser);
    };

    const handleSelectConversation = async (conv) => {
        setActiveChat(conv);
        setShowGroupInfo(false);
        setShowMobileChat(true);
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

        showConfirm(
            "Leave Group",
            `Are you sure you want to leave ${activeChat.name}?`,
            async () => {
                try {
                    await messageAPI.leaveGroup(activeChat._id);
                    setActiveChat(null);
                    setShowGroupInfo(false);
                    fetchConversations();
                } catch (e) {
                    console.error('Failed to leave group', e);
                }
            }
        );
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
            fetchConversations();
            setActiveMessageOptions(null);
        } catch (err) {
            console.error("Failed to delete message", err);
            alert("Failed to delete message");
        }
    };

    const confirmStoryUpload = async () => {
        setUploading(true);
        setShowStoryPrivacyModal(false);
        try {
            // Group stories by their privacy configuration to upload in batches
            const batches = storyUploadConfigs.reduce((acc, config) => {
                const key = `${config.privacy}-${JSON.stringify(config.allowedUsers.sort())}`;
                if (!acc[key]) {
                    acc[key] = {
                        privacy: config.privacy,
                        allowedUsers: config.allowedUsers,
                        files: []
                    };
                }
                acc[key].files.push(config.file);
                return acc;
            }, {});

            // Upload each batch
            for (const key in batches) {
                const batch = batches[key];
                const formData = new FormData();
                batch.files.forEach(file => {
                    formData.append('files', file);
                });
                formData.append('privacy', batch.privacy);
                formData.append('allowedUsers', JSON.stringify(batch.allowedUsers));

                await storyAPI.uploadStory(formData);
            }

            fetchStories();
            showAlert("Success", "Stories uploaded successfully!", "success");
            setStoryUploadConfigs([]);
        } catch (err) {
            console.error("Story upload failed", err);
            showAlert("Error", "Failed to upload some stories", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleStoryUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const initialConfigs = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            privacy: user?.storyPrivacy || 'everyone',
            allowedUsers: user?.storyAllowedUsers || []
        }));

        setStoryUploadConfigs(initialConfigs);
        setShowStoryPrivacyModal(true);
        // Clear input value so same files can be selected again if needed
        e.target.value = '';
    };

    const handleDeleteStory = async (storyId) => {
        showConfirm(
            "Delete Story",
            "Are you sure you want to delete this story? This action cannot be undone.",
            async () => {
                try {
                    await storyAPI.deleteStory(storyId);

                    // Update local state
                    const updatedStories = allStories.map(item => {
                        if (String(item.user._id) === String(user.id)) {
                            return {
                                ...item,
                                stories: item.stories.filter(s => s._id !== storyId)
                            };
                        }
                        return item;
                    }).filter(item => item.stories.length > 0);

                    setAllStories(updatedStories);

                    // Handle viewer navigation after delete
                    if (activeStoryIndex >= viewingStoryUser.stories.length - 1) {
                        if (viewingStoryUser.stories.length <= 1) {
                            setViewingStoryUser(null);
                        } else {
                            setActiveStoryIndex(prev => prev - 1);
                        }
                    }

                    showAlert("Deleted", "Story has been deleted", "success");
                } catch (err) {
                    console.error("Failed to delete story", err);
                    showAlert("Error", "Failed to delete story", "error");
                }
            }
        );
    };

    const handleDeleteAccount = async () => {
        showConfirm(
            "Delete Account",
            "Are you absolutely sure? This will permanently delete your account and all your messages. This action cannot be undone.",
            async () => {
                try {
                    await authAPI.deleteAccount();
                    logout();
                    navigate('/login');
                    showAlert("Account Deleted", "Your account has been successfully deleted.", "success");
                } catch (err) {
                    console.error("Failed to delete account", err);
                    showAlert("Error", "Failed to delete account", "error");
                }
            }
        );
    };

    // -----------------------------------------------------------------
    // Filtering
    // -----------------------------------------------------------------
    // Filtering
    // -----------------------------------------------------------------
    const canSeeStatus = (targetUser) => {
        if (!targetUser) return false;
        if (targetUser._id === user.id) return true;

        const privacy = targetUser.statusPrivacy || 'everyone';
        if (privacy === 'everyone') return true;
        if (privacy === 'nobody') return false;
        if (privacy === 'selected') {
            return (targetUser.statusAllowedUsers || []).some(id => String(id) === String(user.id));
        }
        return true;
    };

    const filteredConversations = conversations.filter(c => {
        if (activeTab === 'chats' && (c.type === 'group' || c.isGroup)) return false;
        if (activeTab === 'groups' && c.type !== 'group' && !c.isGroup) return false;
        const name = (c.type === 'group' || c.isGroup) ? c.name : c.user?.username;
        return name?.toLowerCase().includes(searchQuery.toLowerCase());
    });


    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );



    return (
        <ChatContainer>
            <NavSidebar
                $showMobile={!showMobileChat}
                activeTab={activeTab}
                onTabChange={(tab) => { setActiveTab(tab); setIsCreatingGroup(false); }}
                user={user}
                logout={logout}
                onProfileClick={() => {
                    setViewingUser(user);
                    setProfileMode('edit');
                    setEditAbout(user.about || '');
                    setStoryPrivacy(user.storyPrivacy || 'everyone');
                    setStoryAllowedUsers(user.storyAllowedUsers || []);
                    setStatusPrivacy(user.statusPrivacy || 'everyone');
                    setStatusAllowedUsers(user.statusAllowedUsers || []);
                    setShowProfileModal(true);
                }}
            />

            {/* Sidebar (List Pane) */}
            <Sidebar $showMobileChat={!showMobileChat || !activeChat}>
                <SidebarHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                            {activeTab === 'chats' ? 'Messages' : activeTab === 'groups' ? 'Groups' : 'Stories'}
                        </h2>
                        {activeTab === 'chats' && (
                            <button
                                onClick={() => {
                                    setUserSearchQuery('');
                                    fetchUsers();
                                    setShowNewChatModal(true);
                                }}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: theme.colors.primary[500],
                                    color: 'white',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title="New Chat"
                            >
                                <FiPlus size={20} />
                            </button>
                        )}
                    </div>

                    {activeTab !== 'stories' && (
                        <SearchContainer>
                            <FiSearch size={18} />
                            <Input
                                placeholder={`Search ${activeTab === 'chats' ? 'chats' : activeTab === 'groups' ? 'groups' : 'stories'}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </SearchContainer>
                    )}

                    {activeTab === 'groups' && !isCreatingGroup && (
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
                        (activeTab === 'chats' || activeTab === 'groups') ? (
                            filteredConversations.map((chat, idx) => {
                                const isGroup = chat.type === 'group' || chat.isGroup;
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
                                            {!isGroup && <StatusIndicator $online={canSeeStatus(chat.user) && onlineUsers?.has(chat.user._id)} />}
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
                        ) : activeTab === 'stories' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
                                {/* Add Story Button - Small and Pinned */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem 1rem',
                                        background: theme.colors.primary[50],
                                        borderRadius: '1rem',
                                        cursor: 'pointer',
                                        marginBottom: '0.5rem',
                                        border: `1px solid ${theme.colors.primary[100]}`,
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => document.getElementById('story-upload-input').click()}
                                    onMouseOver={(e) => e.currentTarget.style.background = theme.colors.primary[100]}
                                    onMouseOut={(e) => e.currentTarget.style.background = theme.colors.primary[50]}
                                >
                                    <input
                                        type="file"
                                        id="story-upload-input"
                                        multiple
                                        accept="image/*,video/*"
                                        style={{ display: 'none' }}
                                        onChange={handleStoryUpload}
                                    />
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: theme.colors.primary[500],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <FiPlus size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: theme.colors.primary[700] }}>
                                            {uploading ? 'Uploading...' : 'Add Story'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: theme.colors.primary[600] }}>Share your moments</div>
                                    </div>
                                </div>

                                {/* Stories List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {allStories.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.text.tertiary, fontSize: '0.9rem' }}>
                                            No stories available yet.
                                        </div>
                                    ) : (
                                        allStories.map((item) => (
                                            <ChatItem
                                                key={item.user._id}
                                                onClick={() => {
                                                    setViewingStoryUser(item);
                                                    setActiveStoryIndex(0);
                                                }}
                                                style={{
                                                    background: item.user._id === user.id ? theme.colors.surface : 'transparent',
                                                    border: item.user._id === user.id ? `1px solid ${theme.colors.border}` : 'transparent',
                                                }}
                                            >
                                                <ChatAvatar>
                                                    {item.user.avatarUrl ? (
                                                        <img
                                                            src={`${BACKEND_URL}${item.user.avatarUrl}`}
                                                            alt={item.user.username}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover',
                                                                border: `2px solid ${theme.colors.primary[500]}`,
                                                                padding: '2px'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            borderRadius: '50%',
                                                            background: theme.colors.primary[100],
                                                            color: theme.colors.primary[700],
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 600,
                                                            border: `2px solid ${theme.colors.primary[500]}`
                                                        }}>
                                                            {item.user.username[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </ChatAvatar>
                                                <ChatInfo>
                                                    <ChatName>
                                                        {item.user._id === user.id ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                My Story <span style={{ fontSize: '0.7rem', color: theme.colors.text.tertiary, fontWeight: 400 }}>(Pinned)</span>
                                                            </span>
                                                        ) : item.user.username}
                                                    </ChatName>
                                                    <ChatMessage>{item.stories.length} stories shared</ChatMessage>
                                                </ChatInfo>
                                            </ChatItem>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : null
                    )}</ChatList>

            </Sidebar >

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: showMobileChat || !activeChat ? 'flex' : 'none',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                zIndex: 5,
                width: '100%',
                background: '#F9FAFB'
            }}>
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
                                    <Button
                                        $variant="ghost"
                                        onClick={() => setShowMobileChat(false)}
                                        style={{
                                            padding: '8px',
                                            minWidth: 'auto',
                                            display: 'none',
                                        }}
                                        className="mobile-back-button"
                                    >
                                        <FiX size={24} />
                                    </Button>
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
                                        <div style={{ fontSize: '0.85rem', color: (activeChat.type === 'group' || activeChat.isGroup) ? '#6B7280' : (onlineUsers?.has(activeChat._id || activeChat.user?._id) && canSeeStatus(activeChat.user || activeChat) ? '#10B981' : '#6B7280') }}>
                                            {(activeChat.type === 'group' || activeChat.isGroup) ? `${activeChat.participants?.length || 0} members` : (onlineUsers?.has(activeChat._id || activeChat.user?._id) && canSeeStatus(activeChat.user || activeChat) ? 'Online' : 'Offline')}
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
                                <div ref={messagesEndRef} />
                            </ChatArea>

                            {/* Fullscreen Lightbox Overlay */}
                            {
                                fullscreenImage && (
                                    <div style={{
                                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500
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
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '2rem',
                                color: theme.colors.primary[500],
                                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.1)'
                            }}>
                                <FiMessageSquare size={48} />
                            </div>
                            <EmptyStateText>Welcome to ChatFlow, {user.username}!</EmptyStateText>
                            <EmptyStateSubtext style={{ maxWidth: '300px', margin: '0.5rem auto 2rem' }}>
                                Start a fresh conversation with your friends and colleagues. Your private messages will appear here.
                            </EmptyStateSubtext>
                            <Button size="lg" onClick={() => {
                                setUserSearchQuery('');
                                fetchUsers();
                                setShowNewChatModal(true);
                            }} style={{ boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}>
                                Start Chatting
                            </Button>
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
                            background: 'white', borderRadius: '1.5rem', width: '700px', maxWidth: '95%',
                            height: '550px', maxHeight: '90vh',
                            position: 'relative', display: 'flex',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden'
                        }} onClick={e => e.stopPropagation()}>

                            {/* Settings Sidebar */}
                            <div style={{
                                width: '220px',
                                background: '#F9FAFB',
                                borderRight: '1px solid #E5E7EB',
                                padding: '1.5rem 0',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ padding: '0 1.5rem 1.5rem', fontWeight: 700, fontSize: '1.2rem', color: '#111827' }}>Settings</div>
                                <div
                                    onClick={() => setSettingsTab('profile')}
                                    style={{
                                        padding: '0.75rem 1.5rem', cursor: 'pointer',
                                        background: settingsTab === 'profile' ? '#EEF2FF' : 'transparent',
                                        color: settingsTab === 'profile' ? '#4F46E5' : '#4B5563',
                                        fontWeight: settingsTab === 'profile' ? 600 : 400,
                                        borderLeft: settingsTab === 'profile' ? '4px solid #4F46E5' : '4px solid transparent'
                                    }}
                                >
                                    My Profile
                                </div>
                                <div
                                    onClick={() => setSettingsTab('security')}
                                    style={{
                                        padding: '0.75rem 1.5rem', cursor: 'pointer',
                                        background: settingsTab === 'security' ? '#EEF2FF' : 'transparent',
                                        color: settingsTab === 'security' ? '#4F46E5' : '#4B5563',
                                        fontWeight: settingsTab === 'security' ? 600 : 400,
                                        borderLeft: settingsTab === 'security' ? '4px solid #4F46E5' : '4px solid transparent'
                                    }}
                                >
                                    Privacy & Security
                                </div>
                            </div>

                            {/* Settings Content */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', cursor: 'pointer', zIndex: 10 }} onClick={() => setShowProfileModal(false)}>
                                    <FiX size={24} color="#6B7280" />
                                </div>

                                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                                    {settingsTab === 'profile' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
                                                <div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{viewingUser.username}</div>
                                                    <div style={{ color: '#6B7280' }}>{viewingUser.email}</div>
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>About</div>
                                                {profileMode === 'edit' ? (
                                                    <textarea
                                                        value={editAbout}
                                                        onChange={(e) => setEditAbout(e.target.value)}
                                                        rows={4}
                                                        style={{
                                                            width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #D1D5DB',
                                                            fontFamily: 'inherit', resize: 'none', transition: 'border-color 0.2s'
                                                        }}
                                                        placeholder="Write something about yourself..."
                                                    />
                                                ) : (
                                                    <div style={{
                                                        padding: '1rem', background: '#F9FAFB', borderRadius: '0.75rem', color: '#4B5563',
                                                        fontStyle: viewingUser.about ? 'normal' : 'italic', minHeight: '80px', border: '1px solid #F3F4F6'
                                                    }}>
                                                        {viewingUser.about || "No about info set."}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Privacy & Security</div>
                                                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Manage your account security and content visibility.</div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Default Story Privacy</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>This setting applies to all your stories unless changed during upload.</div>
                                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                        <button
                                                            onClick={() => profileMode === 'edit' && setStoryPrivacy('everyone')}
                                                            style={{
                                                                flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                                                                border: '1px solid', borderColor: storyPrivacy === 'everyone' ? '#4F46E5' : '#D1D5DB',
                                                                background: storyPrivacy === 'everyone' ? '#EEF2FF' : 'white',
                                                                color: storyPrivacy === 'everyone' ? '#4F46E5' : '#374151',
                                                                fontWeight: 600, cursor: profileMode === 'edit' ? 'pointer' : 'default',
                                                                opacity: profileMode === 'edit' ? 1 : 0.8
                                                            }}
                                                        >
                                                            Everyone
                                                        </button>
                                                        <button
                                                            onClick={() => profileMode === 'edit' && setStoryPrivacy('selected')}
                                                            style={{
                                                                flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                                                                border: '1px solid', borderColor: storyPrivacy === 'selected' ? '#4F46E5' : '#D1D5DB',
                                                                background: storyPrivacy === 'selected' ? '#EEF2FF' : 'white',
                                                                color: storyPrivacy === 'selected' ? '#4F46E5' : '#374151',
                                                                fontWeight: 600, cursor: profileMode === 'edit' ? 'pointer' : 'default',
                                                                opacity: profileMode === 'edit' ? 1 : 0.8
                                                            }}
                                                        >
                                                            Selected Users
                                                        </button>
                                                    </div>

                                                    {storyPrivacy === 'selected' && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#4B5563' }}>Selected Users:</div>
                                                            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: '0.75rem', border: '1px solid #F3F4F6' }}>
                                                                {users.filter(u => u._id !== user.id).map(u => (
                                                                    <div
                                                                        key={u._id}
                                                                        onClick={() => {
                                                                            if (profileMode === 'edit') {
                                                                                setStoryAllowedUsers(prev =>
                                                                                    prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]
                                                                                );
                                                                            }
                                                                        }}
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: profileMode === 'edit' ? 'pointer' : 'default' }}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={storyAllowedUsers.includes(u._id)}
                                                                            readOnly
                                                                            style={{ cursor: profileMode === 'edit' ? 'pointer' : 'default', width: '16px', height: '16px' }}
                                                                        />
                                                                        <span style={{ fontSize: '0.95rem', color: '#1F2937' }}>{u.username}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Online Status Privacy</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>Control who can see your online status dot.</div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                                        {['everyone', 'selected', 'nobody'].map(option => (
                                                            <button
                                                                key={option}
                                                                onClick={() => profileMode === 'edit' && setStatusPrivacy(option)}
                                                                style={{
                                                                    flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                                                                    border: '1px solid', borderColor: statusPrivacy === option ? '#4F46E5' : '#D1D5DB',
                                                                    background: statusPrivacy === option ? '#EEF2FF' : 'white',
                                                                    color: statusPrivacy === option ? '#4F46E5' : '#374151',
                                                                    fontWeight: 600, cursor: profileMode === 'edit' ? 'pointer' : 'default',
                                                                    opacity: profileMode === 'edit' ? 1 : 0.8,
                                                                    textTransform: 'capitalize'
                                                                }}
                                                            >
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {statusPrivacy === 'selected' && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#4B5563' }}>Allowed to see status:</div>
                                                            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: '0.75rem', border: '1px solid #F3F4F6' }}>
                                                                {users.filter(u => u._id !== user.id).map(u => (
                                                                    <div
                                                                        key={u._id}
                                                                        onClick={() => {
                                                                            if (profileMode === 'edit') {
                                                                                setStatusAllowedUsers(prev =>
                                                                                    prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]
                                                                                );
                                                                            }
                                                                        }}
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: profileMode === 'edit' ? 'pointer' : 'default' }}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={statusAllowedUsers.includes(u._id)}
                                                                            readOnly
                                                                            style={{ cursor: profileMode === 'edit' ? 'pointer' : 'default', width: '16px', height: '16px' }}
                                                                        />
                                                                        <span style={{ fontSize: '0.95rem', color: '#1F2937' }}>{u.username}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Two-Factor Authentication</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Enhance your account security (Coming Soon).</div>
                                                </div>

                                                {profileMode === 'edit' && (
                                                    <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #F3F4F6' }}>
                                                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#EF4444', marginBottom: '0.5rem' }}>Danger Zone</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>Deleting your account is permanent and cannot be undone.</div>
                                                        <Button
                                                            $variant="danger"
                                                            $fullWidth
                                                            onClick={handleDeleteAccount}
                                                        >
                                                            Delete My Account
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Actions */}
                                <div style={{
                                    padding: '1.5rem 2rem',
                                    borderTop: '1px solid #F3F4F6',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '1rem',
                                    background: '#F9FAFB'
                                }}>
                                    {profileMode === 'view' ? (
                                        <Button onClick={() => setProfileMode('edit')} style={{ minWidth: '120px' }}>
                                            Edit Settings
                                        </Button>
                                    ) : (
                                        <>
                                            <Button $variant="secondary" onClick={() => {
                                                setEditAbout(user.about || '');
                                                setEditAvatar(null);
                                                setStatusPrivacy(user.statusPrivacy || 'everyone');
                                                setStatusAllowedUsers(user.statusAllowedUsers || []);
                                                setProfileMode('view');
                                            }} style={{ minWidth: '100px' }}>
                                                Cancel
                                            </Button>
                                            <Button
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
                                                            avatarUrl,
                                                            storyPrivacy,
                                                            storyAllowedUsers,
                                                            statusPrivacy,
                                                            statusAllowedUsers
                                                        });
                                                        const updatedUser = response.data.user;

                                                        if (updateUser) {
                                                            updateUser(updatedUser);
                                                        } else {
                                                            localStorage.setItem('user', JSON.stringify(updatedUser));
                                                        }

                                                        showAlert("Success", "Settings updated successfully!", "success");
                                                        setProfileMode('view');
                                                    } catch (e) {
                                                        console.error(e);
                                                        showAlert("Error", "Failed to update settings", "error");
                                                    } finally {
                                                        setUploading(false);
                                                    }
                                                }}
                                                disabled={uploading}
                                                style={{ minWidth: '140px' }}
                                            >
                                                {uploading ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setShowNewChatModal(false)}>
                    <div style={{
                        background: 'white', borderRadius: '1.5rem', width: '450px', maxWidth: '95%',
                        maxHeight: '80vh', position: 'relative', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>New Message</h3>
                            <button onClick={() => setShowNewChatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '1rem', background: '#F9FAFB' }}>
                            <SearchContainer style={{ marginBottom: 0 }}>
                                <FiSearch size={18} />
                                <Input
                                    placeholder="Search users..."
                                    autoFocus
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                />
                            </SearchContainer>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                            {filteredUsers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>No users found</div>
                            ) : (
                                filteredUsers.map(u => (
                                    <div
                                        key={u._id}
                                        onClick={() => {
                                            handleSelectUser(u);
                                            setShowNewChatModal(false);
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                                            borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#F3F4F6'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Avatar size="sm">
                                            {u.avatarUrl ? (
                                                <img src={`${BACKEND_URL}${u.avatarUrl}`} alt={u.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                u.username[0].toUpperCase()
                                            )}
                                        </Avatar>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1F2937' }}>{u.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{u.email}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
            {
                viewingStoryUser && viewingStoryUser.stories && viewingStoryUser.stories.length > 0 && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} onClick={() => { setViewingStoryUser(null); setShowViewersList(false); }}>
                        <div style={{
                            width: '100%', maxWidth: '400px', height: '90vh', position: 'relative',
                            display: 'flex', flexDirection: 'column',
                            background: '#111', borderRadius: '1rem', overflow: 'hidden'
                        }} onClick={e => e.stopPropagation()}>

                            {/* Progress Bar */}
                            <div style={{ display: 'flex', gap: '4px', padding: '15px 10px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
                                {viewingStoryUser.stories.map((s, idx) => (
                                    <div key={idx} style={{
                                        flex: 1,
                                        height: '3px',
                                        background: idx === activeStoryIndex ? 'white' : idx < activeStoryIndex ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                                        borderRadius: '2px',
                                        transition: 'background 0.3s'
                                    }}></div>
                                ))}
                            </div>

                            {/* User Info & Close */}
                            <div style={{ position: 'absolute', top: '25px', left: '15px', right: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Avatar size="sm" style={{ border: '1px solid white' }}>
                                        {viewingStoryUser.user.avatarUrl ? (
                                            <img src={`${BACKEND_URL}${viewingStoryUser.user.avatarUrl}`} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                        ) : (
                                            viewingStoryUser.user.username[0].toUpperCase()
                                        )}
                                    </Avatar>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{viewingStoryUser.user.username}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                                            {formatMessageTime(viewingStoryUser.stories[activeStoryIndex].createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {String(viewingStoryUser.user._id) === String(user.id) && (
                                        <button
                                            onClick={() => handleDeleteStory(viewingStoryUser.stories[activeStoryIndex]._id)}
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '5px' }}
                                            title="Delete Story"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    )}
                                    <button onClick={() => setViewingStoryUser(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}>
                                        <FiX size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Buttons (Visible Arrows) */}
                            <div
                                style={{
                                    position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 30,
                                    opacity: activeStoryIndex > 0 ? 1 : 0, transition: 'opacity 0.2s',
                                    pointerEvents: activeStoryIndex > 0 ? 'auto' : 'none'
                                }}
                                onClick={() => setActiveStoryIndex(prev => Math.max(0, prev - 1))}
                            >
                                <button style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    ‹
                                </button>
                            </div>
                            <div
                                style={{
                                    position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 30,
                                    opacity: activeStoryIndex < viewingStoryUser.stories.length - 1 ? 1 : 0.5, transition: 'opacity 0.2s'
                                }}
                                onClick={() => {
                                    if (activeStoryIndex < viewingStoryUser.stories.length - 1) {
                                        setActiveStoryIndex(prev => prev + 1);
                                    } else {
                                        setViewingStoryUser(null);
                                    }
                                }}
                            >
                                <button style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {activeStoryIndex < viewingStoryUser.stories.length - 1 ? '›' : <FiX size={16} />}
                                </button>
                            </div>

                            {/* Main Content Area */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {(() => {
                                    const currentStory = viewingStoryUser.stories[activeStoryIndex];
                                    if (!currentStory) return null;
                                    return currentStory.mediaType === 'video' ? (
                                        <video
                                            key={currentStory._id}
                                            src={`${BACKEND_URL}${currentStory.mediaUrl}`}
                                            autoPlay
                                            playsInline
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <img
                                            key={currentStory._id}
                                            src={`${BACKEND_URL}${currentStory.mediaUrl}`}
                                            alt="story"
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    );
                                })()}
                            </div>

                            {/* Viewers Feature (at the bottom) */}
                            {String(viewingStoryUser.user._id) === String(user.id) && (
                                <div style={{
                                    position: 'absolute', bottom: '0', left: '0', right: '0',
                                    padding: '20px 15px', zIndex: 40,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                                }}>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}
                                        onClick={() => setShowViewersList(!showViewersList)}
                                    >
                                        <FiEye size={18} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                            {viewingStoryUser.stories[activeStoryIndex].views?.length || 0} Viewers
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Viewers List Overlay */}
                            {showViewersList && (
                                <div style={{
                                    position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.9)',
                                    display: 'flex', flexDirection: 'column', padding: '20px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', color: 'white' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Viewed by</h3>
                                        <FiX size={20} cursor="pointer" onClick={() => setShowViewersList(false)} />
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {viewingStoryUser.stories[activeStoryIndex].views?.length > 0 ? (
                                            viewingStoryUser.stories[activeStoryIndex].views.map((v, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <Avatar size="sm">
                                                        {v.user?.avatarUrl ? (
                                                            <img src={`${BACKEND_URL}${v.user.avatarUrl}`} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                                        ) : (
                                                            v.user?.username?.[0]?.toUpperCase() || '?'
                                                        )}
                                                    </Avatar>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>{v.user?.username || 'Unknown User'}</div>
                                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                                                            {new Date(v.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: '2rem' }}>
                                                No views yet
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
            {/* Story Privacy Selector Modal */}
            {showStoryPrivacyModal && (
                <Modal
                    isOpen={showStoryPrivacyModal}
                    onClose={() => setShowStoryPrivacyModal(false)}
                    title="Story Privacy"
                    width="500px"
                    footer={
                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <Button $variant="secondary" $fullWidth onClick={() => setShowStoryPrivacyModal(false)}>Cancel</Button>
                            <Button $fullWidth onClick={confirmStoryUpload} disabled={uploading}>
                                {uploading ? "Uploading..." : "Share Now"}
                            </Button>
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                            Configure privacy for each story. You can make some public and others private.
                        </div>

                        <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                            {storyUploadConfigs.map((config, index) => (
                                <div key={config.id} style={{
                                    padding: '1rem', background: '#F9FAFB', borderRadius: '1rem',
                                    border: '1px solid #F3F4F6'
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '0.5rem', background: '#E5E7EB', overflow: 'hidden' }}>
                                            {config.file.type.startsWith('image') ? (
                                                <img src={URL.createObjectURL(config.file)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎥</div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {config.file.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                                {(config.file.size / (1024 * 1024)).toFixed(2)} MB
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => {
                                                const newConfigs = [...storyUploadConfigs];
                                                newConfigs[index].privacy = 'everyone';
                                                setStoryUploadConfigs(newConfigs);
                                            }}
                                            style={{
                                                flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem',
                                                border: '1px solid', borderColor: config.privacy === 'everyone' ? '#4F46E5' : '#D1D5DB',
                                                background: config.privacy === 'everyone' ? '#EEF2FF' : 'white',
                                                color: config.privacy === 'everyone' ? '#4F46E5' : '#374151',
                                                fontWeight: 600, cursor: 'pointer'
                                            }}
                                        >
                                            Everyone
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newConfigs = [...storyUploadConfigs];
                                                newConfigs[index].privacy = 'selected';
                                                setStoryUploadConfigs(newConfigs);
                                            }}
                                            style={{
                                                flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem',
                                                border: '1px solid', borderColor: config.privacy === 'selected' ? '#4F46E5' : '#D1D5DB',
                                                background: config.privacy === 'selected' ? '#EEF2FF' : 'white',
                                                color: config.privacy === 'selected' ? '#4F46E5' : '#374151',
                                                fontWeight: 600, cursor: 'pointer'
                                            }}
                                        >
                                            Selected
                                        </button>
                                    </div>

                                    {config.privacy === 'selected' && (
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>Visible to:</div>
                                            <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.5rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
                                                {users.filter(u => u._id !== user.id).map(u => (
                                                    <div
                                                        key={u._id}
                                                        onClick={() => {
                                                            const newConfigs = [...storyUploadConfigs];
                                                            const currentSelected = newConfigs[index].allowedUsers;
                                                            newConfigs[index].allowedUsers = currentSelected.includes(u._id)
                                                                ? currentSelected.filter(id => id !== u._id)
                                                                : [...currentSelected, u._id];
                                                            setStoryUploadConfigs(newConfigs);
                                                        }}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={config.allowedUsers.includes(u._id)}
                                                            readOnly
                                                            style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                                                        />
                                                        <span style={{ fontSize: '0.8rem', color: '#374151' }}>{u.username}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                type={confirmConfig.type}
            />
        </ChatContainer >
    );
};

export default ChatPage;
