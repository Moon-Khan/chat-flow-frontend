import React from 'react';
import styled from 'styled-components';

// Button variants based on design specifications
const getButtonStyles = (variant, size, fullWidth, disabled) => (theme) => {
  console.log("THEME IN BUTTON", theme);
  const baseStyles = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: ${theme?.typography?.fontFamily || 'Inter, sans-serif'};
    font-weight: ${theme?.typography?.fontWeight?.[500] || '500'};
    border-radius: ${theme?.borderRadius?.lg || '0.5rem'}; // rounded-xl
    transition: all ${theme?.transitions?.normal || '0.2s ease'};
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    position: relative;
    overflow: hidden;
    border: none;
    outline: none;
    
    &:focus-visible {
      outline: 2px solid ${theme?.colors?.primary?.[500] || '#7C3AED'};
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  const sizeStyles = {
    sm: `
      padding: ${theme?.spacing?.sm || '0.5rem'} ${theme?.spacing?.md || '1rem'};
      font-size: ${theme?.typography?.fontSize?.sm || '0.875rem'};
      min-height: 2.25rem;
    `,
    md: `
      padding: ${theme?.spacing?.md || '1rem'} ${theme?.spacing?.lg || '1.5rem'};
      font-size: ${theme?.typography?.fontSize?.base || '1rem'};
      min-height: 2.75rem;
    `,
    lg: `
      padding: ${theme?.spacing?.lg || '1.5rem'} ${theme?.spacing?.xl || '2rem'};
      font-size: ${theme?.typography?.fontSize?.lg || '1.125rem'};
      min-height: 3.5rem;
    `,
    xl: `
      padding: ${theme?.spacing?.xl || '2rem'} ${theme?.spacing?.['2xl'] || '2.5rem'};
      font-size: ${theme?.typography?.fontSize?.xl || '1.25rem'};
      min-height: 4rem;
    `,
  };

  const variantStyles = {
    primary: `
      background: ${theme?.colors?.gradients?.primary || 'linear-gradient(135deg, #9F67FF, #7C3AED)'};
      color: white;
      font-weight: ${theme?.typography?.fontWeight?.[600] || '600'};
      
      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 25px rgba(124, 58, 237, 0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    
    secondary: `
      background: ${theme?.colors?.surface || '#ffffff'};
      color: ${theme?.colors?.primary?.[600] || '#7C3AED'};
      border: 2px solid ${theme?.colors?.primary?.[200] || '#E9D5FF'};
      font-weight: ${theme?.typography?.fontWeight?.[500] || '500'};
      
      &:hover:not(:disabled) {
        background: ${theme?.colors?.primary?.[50] || '#F3F0FF'};
        border-color: ${theme?.colors?.primary?.[300] || '#D8B4FE'};
        transform: translateY(-1px);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    
    outline: `
      background: transparent;
      color: ${theme?.colors?.primary?.[600] || '#7C3AED'};
      border: 2px solid ${theme?.colors?.primary?.[200] || '#E9D5FF'};
      font-weight: ${theme?.typography?.fontWeight?.[500] || '500'};
      
      &:hover:not(:disabled) {
        background: ${theme?.colors?.primary?.[50] || '#F3F0FF'};
        border-color: ${theme?.colors?.primary?.[300] || '#D8B4FE'};
      }
    `,
    
    ghost: `
      background: transparent;
      color: ${theme?.colors?.text?.secondary || '#6B7280'};
      
      &:hover:not(:disabled) {
        background: ${theme?.colors?.background || '#F9FAFB'};
        color: ${theme?.colors?.text?.primary || '#111827'};
      }
    `,
    
    danger: `
      background: ${theme?.colors?.error?.[500] || '#EF4444'};
      color: white;
      
      &:hover:not(:disabled) {
        background: ${theme?.colors?.error?.[600] || '#DC2626'};
        transform: translateY(-1px);
      }
    `,
  };

  return `
    ${baseStyles}
    ${sizeStyles[size] || sizeStyles.md}
    ${variantStyles[variant] || variantStyles.primary}
    ${fullWidth ? 'width: 100%;' : ''}
  `;
};

const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'fullWidth', 'disabled', 'loading'].includes(prop),
})`
  ${({ variant = 'primary', size = 'md', fullWidth = false, disabled = false }) =>
    getButtonStyles(variant, size, fullWidth, disabled)}
`;

// Loading spinner component
const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Icon wrapper
const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  ${({ iconPosition }) => iconPosition === 'left' ? 'margin-right: 0.5rem;' : 'margin-left: 0.5rem;'}
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  iconPosition,
  className,
  ...props
}) => {

  console.log("BUTTON PROPS", props);
  const renderIcon = (icon, position) => {
    if (!icon) return null;
    return <IconWrapper iconPosition={position}>{icon}</IconWrapper>;
  };

  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {renderIcon(leftIcon, 'left')}
          {children}
          {renderIcon(rightIcon, 'right')}
        </>
      )}
    </StyledButton>
  );
};

export default Button;
