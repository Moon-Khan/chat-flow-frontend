import React from 'react';
import styled from 'styled-components';
import { Button } from '../Components/ui';

// Home page container
const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
`;

// Header
const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Logo = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight[700]};
  background: ${({ theme }) => theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// Main content
const MainContent = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
`;

const WelcomeCard = styled.div`
  text-align: center;
  max-width: 600px;
  padding: ${({ theme }) => theme.spacing['3xl']};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const WelcomeTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight[700]};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const WelcomeMessage = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary[100]};
  color: ${({ theme }) => theme.colors.primary[600]};
  border-radius: 50%;
  font-size: 24px;
`;

const FeatureTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Home = () => {
  return (
    <HomeContainer>
      <Header>
        <Logo>ChatFlow</Logo>
        <Button variant="outline" size="sm">
          Logout
        </Button>
      </Header>

      <MainContent>
        <WelcomeCard>
          <WelcomeTitle>Welcome to ChatFlow! 🎉</WelcomeTitle>
          <WelcomeMessage>
            You're successfully logged in. Start chatting with friends, join rooms,
            and explore all the amazing features we have to offer.
          </WelcomeMessage>

          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>💬</FeatureIcon>
              <FeatureTitle>Real-time Chat</FeatureTitle>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>👥</FeatureIcon>
              <FeatureTitle>Group Rooms</FeatureTitle>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>⚙️</FeatureIcon>
              <FeatureTitle>Customizable</FeatureTitle>
            </FeatureCard>
          </FeatureGrid>

          <Button variant="primary" size="lg">
            Start Chatting
          </Button>
        </WelcomeCard>
      </MainContent>
    </HomeContainer>
  );
};

export default Home;