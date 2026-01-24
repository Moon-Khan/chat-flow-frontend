import styled from 'styled-components';

export const UnreadBadge = styled.div`
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
