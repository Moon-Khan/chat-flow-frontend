import React, { forwardRef } from 'react';
import styled from 'styled-components';

// Input container
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// Label component
const Label = styled.label`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Required indicator
const Required = styled.span`
  color: ${({ theme }) => theme.colors.error[500]};
  font-weight: ${({ theme }) => theme.typography.fontWeight[700]};
`;

// Input wrapper for icons
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Icon wrapper
const IconWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  pointer-events: none;
  z-index: 1;

  &.left {
    left: 0.75rem;
  }

  &.right {
    right: 0.75rem;
    cursor: pointer;
    pointer-events: auto;
    
    &:hover {
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
`;

// Styled input based on exact design specifications
const StyledInput = styled.input`
  width: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight[400]};
  background: #F9FAFB; // Exact specification
  border: 1px solid #E5E7EB; // Exact specification
  border-radius: ${({ theme }) => theme.borderRadius.md}; // rounded-lg
  padding: 0.75rem 1rem; // px-4 py-3
  color: #111827; // Exact specification
  transition: all ${({ theme }) => theme.transitions.normal};
  outline: none;

  &::placeholder {
    color: #9CA3AF; // Exact specification
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[500]}; // focus:ring-2
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: not-allowed;
  }

  &:error {
    border-color: ${({ theme }) => theme.colors.error[500]};
  }

  /* Adjust padding when icons are present */
  &.has-left-icon {
    padding-left: 2.5rem;
  }

  &.has-right-icon {
    padding-right: 2.5rem;
  }

  &.has-both-icons {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
`;

// Error message
const ErrorMessage = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.error[500]};
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Helper text
const HelperText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.25rem;
`;

const Input = forwardRef((
  {
    label,
    required = true,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconClick,
    className,
    ...props
  },
  ref
) => {
  const getInputClassName = () => {
    let className = '';
    if (leftIcon) className += 'has-left-icon ';
    if (rightIcon) className += 'has-right-icon ';
    if (leftIcon && rightIcon) className = 'has-both-icons';
    return className.trim();
  };

  return (
    <InputContainer className={className}>
      {label && (
        <Label>
          {label}
          {required && <Required>*</Required>}
        </Label>
      )}
      
      <InputWrapper>
        {leftIcon && (
          <IconWrapper className="left">
            {leftIcon}
          </IconWrapper>
        )}
        
        <StyledInput
          ref={ref}
          className={getInputClassName()}
          error={error}
          {...props}
        />
        
        {rightIcon && (
          <IconWrapper 
            className="right" 
            onClick={onRightIconClick}
            role={onRightIconClick ? 'button' : undefined}
            tabIndex={onRightIconClick ? 0 : undefined}
          >
            {rightIcon}
          </IconWrapper>
        )}
      </InputWrapper>
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      
      {helperText && !error && (
        <HelperText>
          {helperText}
        </HelperText>
      )}
    </InputContainer>
  );
});

Input.displayName = 'Input';

export default Input;
