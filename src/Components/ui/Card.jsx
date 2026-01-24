import React from 'react';
import styled from 'styled-components';

// Card container with exact design specifications
const StyledCard = styled.div`
  background: ${({ theme, $variant }) =>
    $variant === 'glass' ? 'rgba(255, 255, 255, 0.7)' : theme.colors.surface};
  backdrop-filter: ${({ $variant }) =>
    $variant === 'glass' ? 'blur(10px)' : 'none'};
  border: ${({ theme, $variant }) =>
    $variant === 'glass' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.xl}; // rounded-2xl
  box-shadow: ${({ theme, $variant }) =>
    $variant === 'glass' ? '0 8px 32px 0 rgba(31, 38, 135, 0.1)' : theme.shadows.soft};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $variant }) =>
    $variant === 'glass' ? '0 8px 32px 0 rgba(31, 38, 135, 0.15)' : '0 8px 30px rgba(0, 0, 0, 0.12)'};
  }
`;

// Card content container
export const CardContent = styled.div`
  padding: ${({ $padding, theme }) => {
    switch ($padding) {
      case 'sm':
        return theme.spacing.lg;
      case 'md':
        return theme.spacing.xl;
      case 'lg':
        return theme.spacing['2xl'];
      case 'xl':
        return theme.spacing['3xl'];
      default:
        return '2.5rem'; // p-10 exact specification
    }
  }};
`;

// Card header
const CardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing['2xl']};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

// Card title
const CardTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight[700]};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

// Card subtitle
const CardSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.5rem 0 0 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

// Card description
const CardDescription = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight[400]};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

// Card footer
const CardFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

// Main Card component
const Card = React.forwardRef((
  {
    children,
    className,
    padding = 'default',
    variant = 'default',
    ...props
  },
  ref
) => {
  return (
    <StyledCard
      ref={ref}
      className={className}
      $variant={variant}
      $padding={padding}
      {...props}
    >
      <CardContent $padding={padding}>
        {children}
      </CardContent>
    </StyledCard>
  );
});

// Compound components
Card.Header = React.forwardRef(({ children, className, ...props }, ref) => (
  <CardHeader ref={ref} className={className} {...props}>
    {children}
  </CardHeader>
));

Card.Title = React.forwardRef(({ children, className, ...props }, ref) => (
  <CardTitle ref={ref} className={className} {...props}>
    {children}
  </CardTitle>
));

Card.Subtitle = React.forwardRef(({ children, className, ...props }, ref) => (
  <CardSubtitle ref={ref} className={className} {...props}>
    {children}
  </CardSubtitle>
));

Card.Description = React.forwardRef(({ children, className, ...props }, ref) => (
  <CardDescription ref={ref} className={className} {...props}>
    {children}
  </CardDescription>
));

Card.Content = React.forwardRef(({ children, className, padding, ...props }, ref) => (
  <CardContent ref={ref} className={className} padding={padding} {...props}>
    {children}
  </CardContent>
));

Card.Footer = React.forwardRef(({ children, className, ...props }, ref) => (
  <CardFooter ref={ref} className={className} {...props}>
    {children}
  </CardFooter>
));

Card.displayName = 'Card';

export default Card;
