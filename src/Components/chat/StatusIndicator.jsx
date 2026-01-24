import styled from 'styled-components';

export const StatusIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $online, theme }) =>
        $online ? theme.colors.success[500] : theme.colors.text.tertiary};
  border: 2px solid ${({ theme }) => theme.colors.surface};
`;
