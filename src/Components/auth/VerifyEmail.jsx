import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiShield, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { Button, Input, Card, CardContent } from '../ui';
import { authAPI } from '../../services/api';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const VerifyContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background};
`;

const StyledCard = styled(Card)`
  animation: ${fadeIn} 0.6s ease-out;
  max-width: 400px;
  width: 100%;
`;

const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary[50]};
  color: ${({ theme }) => theme.colors.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Description = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const OtpContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const OtpInput = styled.input`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 2px solid ${({ theme, error }) => error ? theme.colors.error[500] : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[100]};
  }
`;

const TimerText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, expired }) => expired ? theme.colors.error[500] : theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme, disabled }) => disabled ? theme.colors.text.tertiary : theme.colors.primary[500]};
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 auto;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }
`;

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/login');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeout(() => navigate('/login'), 2000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter the full 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const { data } = await authAPI.verifyEmail({ email, code });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/chat');
        } catch (err) {
            setError(err.message || 'Verification failed');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (isResending || timeLeft > 0) return;

        setIsResending(true);
        setError('');
        try {
            await authAPI.resendCode(email);
            setTimeLeft(120);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } catch (err) {
            setError(err.message || 'Failed to resend code');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <VerifyContainer>
            <StyledCard variant="glass" padding="xl">
                <CardContent>
                    <IconCircle>
                        <FiShield size={40} />
                    </IconCircle>
                    <Title>Check your email</Title>
                    <Description>
                        We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your account.
                    </Description>

                    {error && (
                        <div style={{ color: '#EF4444', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <OtpContainer>
                        {otp.map((digit, index) => (
                            <OtpInput
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                error={!!error}
                                disabled={timeLeft === 0}
                            />
                        ))}
                    </OtpContainer>

                    <TimerText expired={timeLeft === 0}>
                        {timeLeft > 0 ? (
                            `Code expires in ${formatTime(timeLeft)}`
                        ) : (
                            'Code expired! Redirecting to login...'
                        )}
                    </TimerText>

                    <Button
                        $fullWidth
                        size="lg"
                        onClick={handleVerify}
                        disabled={isLoading || timeLeft === 0 || otp.some(d => !d)}
                        loading={isLoading}
                    >
                        Verify Account
                    </Button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <ResendButton onClick={handleResend} disabled={timeLeft > 0 || isResending}>
                            {isResending ? (
                                <><FiRefreshCw size={16} /> Resending...</>
                            ) : (
                                'Resend Code'
                            )}
                        </ResendButton>
                    </div>

                    <div
                        style={{
                            marginTop: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            color: '#6B7280',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/login')}
                    >
                        <FiArrowLeft size={16} /> Back to Login
                    </div>
                </CardContent>
            </StyledCard>
        </VerifyContainer>
    );
};

export default VerifyEmail;
