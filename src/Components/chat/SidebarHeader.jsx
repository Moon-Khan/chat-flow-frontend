import styled from 'styled-components';

export const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  position: relative;
  z-index: 2;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
`;
