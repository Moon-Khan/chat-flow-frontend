import styled from 'styled-components';

export const Sidebar = styled.div`
  width: 320px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 60px;
    z-index: 100;
    transform: ${({ $showMobileChat }) => ($showMobileChat ? 'translateX(0)' : 'translateX(-100%)')};
    visibility: ${({ $showMobileChat }) => ($showMobileChat ? 'visible' : 'hidden')};
    display: ${({ $showMobileChat }) => ($showMobileChat ? 'flex' : 'none')};
  }
`;
