import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { FiUsers, FiMessageSquare, FiPlus, FiSearch, FiMoreVertical } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { Button, Input } from '../Components/ui';

const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const Sidebar = styled.div`
  width: 320px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const UserStatus = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TabsContainer = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 0.25rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $active, theme }) => 
    $active && `
      background: ${theme.colors.primary[500]};
      color: white;
    `
  }
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primary[600] : theme.colors.background
    };
  }
`;

const SearchContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const ChatAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary[600]};
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
  position: relative;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $online, theme }) => 
    $online ? theme.colors.success[500] : theme.colors.text.tertiary
  };
  border: 2px solid ${({ theme }) => theme.colors.surface};
`;

const ChatInfo = styled.div`
  flex: 1;
`;

const ChatName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const ChatMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

const ChatTime = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const UnreadBadge = styled.div`
  background: ${({ theme }) => theme.colors.primary[500]};
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  opacity: 0.3;
`;

const EmptyStateText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EmptyStateSubtext = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const mockChats = [
    { id: 1, name: 'Alice Johnson', message: 'Hey! How are you doing?', time: '2:30 PM', unread: 2, online: true },
    { id: 2, name: 'Bob Smith', message: 'Can we schedule a meeting?', time: '1:15 PM', unread: 0, online: false },
    { id: 3, name: 'Carol White', message: 'Thanks for your help!', time: '12:45 PM', unread: 1, online: true },
    { id: 4, name: 'Development Team', message: 'John: The new feature is ready', time: '11:30 AM', unread: 5, online: true, isGroup: true },
  ];

  const mockUsers = [
    { id: 1, name: 'Alice Johnson', status: 'Active', online: true },
    { id: 2, name: 'Bob Smith', status: 'Away', online: false },
    { id: 3, name: 'Carol White', status: 'Active', online: true },
    { id: 4, name: 'David Brown', status: 'Offline', online: false },
    { id: 5, name: 'Emma Davis', status: 'Active', online: true },
  ];

  const filteredChats = mockChats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ChatContainer>
      <Sidebar>
        <SidebarHeader>
          <UserSection>
            <UserAvatar>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </UserAvatar>
            <UserInfo>
              <UserName>{user?.username || 'User'}</UserName>
              <UserStatus>🟢 Active</UserStatus>
            </UserInfo>
            <Button variant="ghost" size="sm">
              <FiMoreVertical size={18} />
            </Button>
          </UserSection>

          <TabsContainer>
            <Tab 
              $active={activeTab === 'chats'} 
              onClick={() => setActiveTab('chats')}
            >
              <FiMessageSquare size={16} style={{ marginRight: '0.5rem' }} />
              Chats
            </Tab>
            <Tab 
              $active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')}
            >
              <FiUsers size={16} style={{ marginRight: '0.5rem' }} />
              All Users
            </Tab>
          </TabsContainer>

          <SearchContainer>
            <Input
              placeholder={`Search ${activeTab === 'chats' ? 'chats' : 'users'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<FiSearch size={18} />}
            />
          </SearchContainer>

          {activeTab === 'chats' && (
            <ActionButtons>
              <Button variant="primary" size="sm" fullWidth>
                <FiPlus size={16} style={{ marginRight: '0.5rem' }} />
                New Chat
              </Button>
              <Button variant="outline" size="sm" fullWidth>
                <FiUsers size={16} style={{ marginRight: '0.5rem' }} />
                Create Group
              </Button>
            </ActionButtons>
          )}
        </SidebarHeader>

        <ChatList>
          {activeTab === 'chats' ? (
            filteredChats.map(chat => (
              <ChatItem key={chat.id}>
                <ChatAvatar>
                  {chat.name[0]}
                  <StatusIndicator $online={chat.online} />
                </ChatAvatar>
                <ChatInfo>
                  <ChatName>{chat.name}</ChatName>
                  <ChatMessage>{chat.message}</ChatMessage>
                </ChatInfo>
                <ChatMeta>
                  <ChatTime>{chat.time}</ChatTime>
                  {chat.unread > 0 && (
                    <UnreadBadge>{chat.unread}</UnreadBadge>
                  )}
                </ChatMeta>
              </ChatItem>
            ))
          ) : (
            filteredUsers.map(user => (
              <ChatItem key={user.id}>
                <ChatAvatar>
                  {user.name[0]}
                  <StatusIndicator $online={user.online} />
                </ChatAvatar>
                <ChatInfo>
                  <ChatName>{user.name}</ChatName>
                  <ChatMessage>{user.status}</ChatMessage>
                </ChatInfo>
                <ChatMeta>
                  <ChatTime>
                    {user.online ? '🟢 Active' : '⚫ Offline'}
                  </ChatTime>
                </ChatMeta>
              </ChatItem>
            ))
          )}
        </ChatList>
      </Sidebar>

      <MainContent>
        <ChatHeader>
          <div>
            <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>
              {activeTab === 'chats' ? 'Select a chat' : 'Select a user'}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
              Choose a conversation to start messaging
            </div>
          </div>
        </ChatHeader>
        
        <ChatArea>
          <EmptyState>
            <EmptyStateIcon>
              <FiMessageSquare size={64} />
            </EmptyStateIcon>
            <EmptyStateText>
              {activeTab === 'chats' ? 'No chat selected' : 'No user selected'}
            </EmptyStateText>
            <EmptyStateSubtext>
              {activeTab === 'chats' 
                ? 'Choose a chat from the sidebar to start messaging'
                : 'Select a user to start a conversation'
              }
            </EmptyStateSubtext>
          </EmptyState>
        </ChatArea>
      </MainContent>
    </ChatContainer>
  );
};

export default Chat;
