import React, { useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Button, Input, Card, CardContent } from '../ui';
import { useForm } from '../../hooks/useForm';
import { authValidation } from '../../utils/validation';
import api, { authAPI } from '../../services/api';

const float = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -50px) rotate(5deg); }
  66% { transform: translate(-20px, 20px) rotate(-5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledCard = styled(Card)`
  animation: ${fadeIn} 0.6s ease-out;
`;

// New background element for blurred blobs
const BackgroundBlobs = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 40vw;
    height: 40vw;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: ${float} 20s infinite linear;
  }
  
  &::before {
    background: ${({ theme }) => theme.colors.primary[500]};
    top: -10%;
    left: -10%;
  }
  
  &::after {
    background: ${({ theme }) => theme.colors.secondary[500]};
    bottom: -10%;
    right: -10%;
    animation-delay: -10s;
  }
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
`;

// Logo/Brand section
const BrandSection = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Logo = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight[700]};
  background: ${({ theme }) => theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const Tagline = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight[400]};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Tab container
const TabContainer = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 0.2rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  gap: 0.2rem;
`;

// Individual tab
const Tab = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  outline: none;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background: ${({ theme }) => theme.colors.primary[500]};
    color: white;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
  }
`;

// Form container
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

// Welcome text
const WelcomeText = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const WelcomeTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight[700]};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight[400]};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

// Form footer
const FormFooter = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const FooterText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

const Link = styled.button`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary[500]};
  background: none;
  border: none;
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  text-decoration: underline;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary[600]};
  }
`;

// Divider
const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.lg} 0;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
`;

const DividerText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

// Social buttons container
const SocialButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SocialButton = styled(Button)`
  justify-content: flex-start;
  gap: 0.75rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const Login = ({ onToggleMode }) => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { values: formData, errors, touched, handleChange, handleBlur, validateForm } = useForm({
    email: '',
    password: ''
  }, authValidation.login);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form data:', formData);
    console.log('Errors:', errors);

    // Trigger validation on all fields
    const isValid = validateForm();
    console.log('Is valid:', isValid);

    if (!isValid) {
      console.log('Validation failed, form not submitted');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authAPI.login(formData);
      login(response.data.user, response.data.token);
      navigate('/chat');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <BackgroundBlobs />
      <StyledCard variant="glass" padding="md" style={{ maxWidth: '380px', width: '100%' }}>
        <CardContent>
          <BrandSection>
            <Logo>ChatFlow</Logo>
            <Tagline>Connect. Collaborate. Communicate.</Tagline>
          </BrandSection>

          <TabContainer>
            <Tab className="active">Login</Tab>
            <Tab onClick={onToggleMode}>Sign Up</Tab>
          </TabContainer>

          <WelcomeText>
            <WelcomeTitle>Welcome Back!</WelcomeTitle>
            <WelcomeSubtitle>
              Enter your credentials to access your account
            </WelcomeSubtitle>
          </WelcomeText>

          {errorMessage && (
            <div style={{
              padding: '0.75rem',
              background: '#FEE2E2',
              color: '#B91C1C',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              textAlign: 'center',
              border: '1px solid #FECACA'
            }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData?.email || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                required
                leftIcon={<FiMail size={18} />}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData?.password || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                required
                leftIcon={<FiLock size={18} />}
                rightIcon={
                  showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />
                }
                onRightIconClick={() => setShowPassword(!showPassword)}
              />

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </FormContainer>
          </form>

          <FormFooter>
            <FooterText>
              Don't have an account?{' '}
              <Link onClick={onToggleMode}>Sign up</Link>
            </FooterText>
          </FormFooter>
        </CardContent>
      </StyledCard>
    </LoginContainer>
  );
};

export default Login;
