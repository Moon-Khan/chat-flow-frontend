import React from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  padding-left: ${({ $hasLeftIcon, theme }) => ($hasLeftIcon ? '40px' : theme.spacing.sm)};
  padding-right: ${({ $hasRightIcon, theme }) => ($hasRightIcon ? '40px' : theme.spacing.sm)};
  border: 1px solid ${({ $error, theme }) => ($error ? '#EF4444' : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ $error, theme }) => ($error ? '#EF4444' : theme.colors.primary[500])};
    box-shadow: 0 0 0 2px ${({ $error, theme }) => ($error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)')};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
  
  &.left {
    left: 12px;
  }
  
  &.right {
    right: 12px;
  }
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: #EF4444;
`;

export const Input = ({ label, error, leftIcon, rightIcon, onRightIconClick, ...props }) => {
  return (
    <InputWrapper>
      {label && <Label>{label}</Label>}
      <InputContainer>
        {leftIcon && <IconWrapper className="left">{leftIcon}</IconWrapper>}
        <StyledInput
          $error={!!error}
          $hasLeftIcon={!!leftIcon}
          $hasRightIcon={!!rightIcon}
          {...props}
        />
        {rightIcon && (
          <IconWrapper className="right" $isClickable={!!onRightIconClick} onClick={onRightIconClick}>
            {rightIcon}
          </IconWrapper>
        )}
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
};
