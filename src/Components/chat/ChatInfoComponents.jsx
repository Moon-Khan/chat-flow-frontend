import styled from 'styled-components';

export const ChatInfo = styled.div`
  flex: 1;
`;

export const ChatName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.15rem;
  font-size: 0.95rem;
`;

export const ChatMessage = styled.div`
  font-size: 0.825rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
`;

export const ChatMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

export const ChatTime = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;
