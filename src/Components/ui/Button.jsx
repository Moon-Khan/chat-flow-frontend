import styled, { css } from 'styled-components';

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ size, theme }) => {
    if (size === 'lg') return `${theme.spacing.md} ${theme.spacing.xl}`;
    if (size === 'sm') return `${theme.spacing.xs} ${theme.spacing.sm}`;
    return `${theme.spacing.sm} ${theme.spacing.md}`;
  }};
  background: ${({ theme }) => theme.colors.primary[500]};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  font-size: ${({ size, theme }) => (size === 'lg' ? theme.typography.fontSize.lg : theme.typography.fontSize.md)};
  transition: all 0.2s ease;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover {
    background: ${({ theme }) => theme.colors.primary[600]};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  ${({ $variant, theme }) => $variant === 'secondary' && css`
    background: transparent;
    border: 1px solid ${theme.colors.border};
    color: ${theme.colors.text.primary};
    &:hover {
      background: ${theme.colors.background};
      box-shadow: none;
    }
  `}

  ${({ $variant, theme }) => $variant === 'ghost' && css`
    background: transparent;
    color: ${theme.colors.text.secondary};
    &:hover {
      background: ${theme.colors.background};
      color: ${theme.colors.text.primary};
      box-shadow: none;
    }
  `}
`;
