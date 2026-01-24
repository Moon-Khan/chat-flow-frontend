import React from 'react';
import styled from 'styled-components';
import { FiMessageSquare, FiGrid, FiLayers, FiLogOut, FiSettings } from 'react-icons/fi';
import { Avatar } from '../ui';

const NavContainer = styled.div`
  width: 80px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  gap: ${({ theme }) => theme.spacing.xl};
  z-index: 101;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    height: 60px;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 ${({ theme }) => theme.spacing.lg};
    justify-content: space-around;
    gap: 0;
    border-right: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    display: ${({ $showMobile }) => ($showMobile ? 'flex' : 'none')};
  }
`;

const NavIcon = styled.div`
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary[600] : theme.colors.text.tertiary)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary[50] : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[600]};
    background: ${({ theme }) => theme.colors.primary[50]};
  }

  ${({ $active, theme }) => $active && `
    &::after {
      content: '';
      position: absolute;
      left: -2px;
      top: 50%;
      transform: translateY(-50%);
      height: 20px;
      width: 4px;
      background: ${theme.colors.primary[600]};
      border-radius: 0 4px 4px 0;
    }
  `}

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 8px;
    &::after {
      display: none;
    }
  }
`;

const BottomIcons = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-top: 0;
    flex-direction: row;
  }
`;

export const NavSidebar = ({ activeTab, onTabChange, user, logout, onProfileClick }) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    return (
        <NavContainer>
            <div onClick={onProfileClick} style={{ cursor: 'pointer', marginBottom: '10px' }}>
                <Avatar size="sm">
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
            </div>

            <NavIcon $active={activeTab === 'chats'} onClick={() => onTabChange('chats')} title="Chats">
                <FiMessageSquare size={24} />
            </NavIcon>

            <NavIcon $active={activeTab === 'groups'} onClick={() => onTabChange('groups')} title="Groups">
                <FiGrid size={24} />
            </NavIcon>

            <NavIcon $active={activeTab === 'stories'} onClick={() => onTabChange('stories')} title="Stories">
                <FiLayers size={24} />
            </NavIcon>

            <BottomIcons>
                <NavIcon onClick={onProfileClick} title="Settings">
                    <FiSettings size={22} />
                </NavIcon>
                <NavIcon onClick={logout} title="Logout" style={{ color: '#EF4444' }}>
                    <FiLogOut size={22} />
                </NavIcon>
            </BottomIcons>
        </NavContainer>
    );
};
