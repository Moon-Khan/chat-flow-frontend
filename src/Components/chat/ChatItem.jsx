import styled from 'styled-components';

export const ChatItem = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary[50] : 'transparent')};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary[100] : 'transparent')};

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.primary[100] : theme.colors.background)};
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: translateY(0);
  }
`;
