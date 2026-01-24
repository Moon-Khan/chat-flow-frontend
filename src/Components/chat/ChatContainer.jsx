import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
  position: relative;
`;
