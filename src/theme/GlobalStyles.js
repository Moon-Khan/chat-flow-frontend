import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight[400]};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Focus styles */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }

  /* Remove default button styles */
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  /* Remove default input styles */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* Link styles */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Animation utilities */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export default GlobalStyles;
