import { createGlobalStyle } from 'styled-components';
export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; }
  body { margin: 0; background: ${({ theme }) => theme.colors.canvas}; color: ${({ theme }) => theme.colors.ink}; font-family: ${({ theme }) => theme.font.body}; -webkit-font-smoothing: antialiased; }
  button, input, textarea { font: inherit; }
  button, a, textarea { -webkit-tap-highlight-color: transparent; }
  button { cursor: pointer; }
  button:disabled { cursor: not-allowed; }
  a { color: ${({ theme }) => theme.colors.accent}; text-underline-offset: 3px; }
  :focus-visible { outline: 3px solid ${({ theme }) => theme.colors.accent}; outline-offset: 4px; }
  ::selection { background: ${({ theme }) => theme.colors.accentSoft}; }
  h1, h2, h3, p { margin-top: 0; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
`;
