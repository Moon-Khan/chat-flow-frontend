import styled from 'styled-components';

export const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: ${({ theme }) => theme.spacing.md};
`;
