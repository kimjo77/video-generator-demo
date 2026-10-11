import styled from 'styled-components';
export const Button = styled.button<{ $variant?: 'primary' | 'secondary'; $full?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space.sm};
  min-height: 48px;
  padding: 12px 20px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid
    ${({ theme, $variant }) => ($variant === 'secondary' ? theme.colors.border : theme.colors.accent)};
  background: ${({ theme, $variant }) => ($variant === 'secondary' ? theme.colors.surface : theme.colors.accent)};
  color: ${({ theme, $variant }) => ($variant === 'secondary' ? theme.colors.ink : theme.colors.surface)};
  width: ${({ $full }) => ($full ? '100%' : 'auto')};
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: 650;
  transition:
    background 0.15s,
    transform 0.15s;
  &:hover:not(:disabled) {
    background: ${({ theme, $variant }) => ($variant === 'secondary' ? theme.colors.canvas : theme.colors.accentHover)};
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.5;
  }
`;
