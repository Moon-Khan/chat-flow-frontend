import styled from 'styled-components';

export const TabsContainer = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 0.25rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
