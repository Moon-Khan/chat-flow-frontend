import styled from 'styled-components';

export const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
`;
