import styled, { css } from 'styled-components';

export const Tab = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $active, theme }) =>
        $active &&
        css`
      background: ${theme.colors.primary[500]};
      color: #fff;
    `}

  &:hover {
    background: ${({ $active, theme }) =>
        $active ? theme.colors.primary[600] : theme.colors.background};
  }
`;
