import React, { useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
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

const SignupContainer = styled.div`
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

// Password strength indicator
const PasswordStrength = styled.div`
  margin-top: 0.5rem;
`;

const StrengthBar = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
`;

const StrengthFill = styled.div`
  height: 100%;
  border-radius: 2px;
  transition: all ${({ theme }) => theme.transitions.normal};
  background: ${({ strength, theme }) => {
    switch (strength) {
      case 'weak':
        return theme.colors.error[500];
      case 'medium':
        return theme.colors.warning[500];
      case 'strong':
        return theme.colors.success[500];
      default:
        return theme.colors.border;
    }
  }};
  width: ${({ strength }) => {
    switch (strength) {
      case 'weak':
        return '33%';
      case 'medium':
        return '66%';
      case 'strong':
        return '100%';
      default:
        return '0%';
    }
  }};
`;

const StrengthText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ strength, theme }) => {
    switch (strength) {
      case 'weak':
        return theme.colors.error[500];
      case 'medium':
        return theme.colors.warning[500];
      case 'strong':
        return theme.colors.success[500];
      default:
        return theme.colors.text.tertiary;
    }
  }};
`;

// Terms and conditions
const TermsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
  accent-color: ${({ theme }) => theme.colors.primary[500]};
`;

const TermsText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const TermsLink = styled.button`
  color: ${({ theme }) => theme.colors.primary[500]};
  background: none;
  border: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight[500]};
  text-decoration: underline;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary[600]};
  }
`;

// Bottom note with lock emoji
const BottomNote = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

const Signup = ({ onToggleMode }) => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { values: formData, errors, touched, handleChange, handleBlur, validateForm } = useForm({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  }, authValidation.signup);

  const checkPasswordStrength = (password) => {
    if (!password) return '';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    if (strength <= 1) return 'weak';
    if (strength <= 2) return 'medium';
    return 'strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Signup Form data:', formData);
    console.log('Signup Errors:', errors);

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
      console.log("formData", formData);
      const response = await authAPI.register({
        username: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      login(response.data.user, response.data.token);
      navigate('/chat');
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  return (
    <SignupContainer>
      <BackgroundBlobs />
      <StyledCard variant="glass" padding="md" style={{ maxWidth: '380px', width: '100%' }}>
        <CardContent>
          <BrandSection>
            <Logo>ChatFlow</Logo>
            <Tagline>Connect. Collaborate. Communicate.</Tagline>
          </BrandSection>

          <TabContainer>
            <Tab onClick={onToggleMode}>Login</Tab>
            <Tab className="active">Sign Up</Tab>
          </TabContainer>

          <WelcomeText>
            <WelcomeTitle>Create Account</WelcomeTitle>
            <WelcomeSubtitle>
              Join ChatFlow and start connecting with others
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
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData?.fullName || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fullName}
                required
                leftIcon={<FiUser size={18} />}
              />

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
                placeholder="Create a strong password"
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

              {formData?.password && (
                <PasswordStrength>
                  <StrengthBar>
                    <StrengthFill strength={passwordStrength} />
                  </StrengthBar>
                  <StrengthText strength={passwordStrength}>
                    Password strength: {passwordStrength || 'Very weak'}
                  </StrengthText>
                </PasswordStrength>
              )}

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData?.confirmPassword || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                required
                leftIcon={<FiLock size={18} />}
                rightIcon={
                  showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />
                }
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              <TermsContainer>
                <Checkbox
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData?.agreeToTerms || false}
                  onChange={handleChange}
                />
                <TermsText>
                  I agree to the{' '}
                  <TermsLink>Terms of Service</TermsLink> and{' '}
                  <TermsLink>Privacy Policy</TermsLink>
                </TermsText>
              </TermsContainer>

              {errors.agreeToTerms && (
                <div style={{ color: 'var(--color-error-500)', fontSize: '0.875rem', marginTop: '-0.5rem' }}>
                  {errors.agreeToTerms}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </FormContainer>
          </form>

          <BottomNote>
            🔐 Your information is secure and encrypted
          </BottomNote>

          <FormFooter>
            <FooterText>
              Already have an account?{' '}
              <Link onClick={onToggleMode}>Sign In</Link>
            </FooterText>
          </FormFooter>
        </CardContent>
      </StyledCard>
    </SignupContainer>
  );
};

export default Signup;
