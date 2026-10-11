import styled from 'styled-components';
export const StatusBadge = styled.span<{ $tone?: 'ready' | 'working' | 'error' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: ${({ theme }) => theme.font.size.caption};
  font-weight: 650;
  white-space: nowrap;
  background: ${({ theme, $tone }) => ($tone === 'error' || $tone === 'working' ? theme.colors.accentSoft : theme.colors.canvas)};
  color: ${({ theme, $tone }) => ($tone === 'error' ? theme.colors.danger : $tone === 'ready' ? theme.colors.success : theme.colors.muted)};
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;
