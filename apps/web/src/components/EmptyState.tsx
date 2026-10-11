import { Film, LoaderCircle } from 'lucide-react';
import styled, { keyframes } from 'styled-components';
const spin = keyframes`to { transform: rotate(360deg); }`;
const Landscape = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  background: #f2e8db;
  &::before {
    content: '';
    position: absolute;
    width: 118px;
    height: 118px;
    border-radius: 50%;
    background: #e7af83;
    top: 15%;
    left: 16%;
  }
  &::after {
    content: '';
    position: absolute;
    width: 180%;
    height: 70%;
    background: #e2bda2;
    border-radius: 50% 50% 0 0;
    bottom: -24%;
    left: -65%;
    transform: rotate(-22deg);
    z-index: -1;
  }
`;
const Hill = styled.div`
  position: absolute;
  width: 170%;
  height: 55%;
  border-radius: 50% 50% 0 0;
  background: #cd8062;
  bottom: -22%;
  right: -65%;
  transform: rotate(24deg);
  z-index: -1;
`;
const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 32px;
  color: #634a3a;
  > span {
    background: #ffffffb8;
    border: 1px solid #ffffff70;
    border-radius: 16px;
    padding: 15px;
    display: grid;
    place-items: center;
    backdrop-filter: blur(6px);
  }
  strong {
    font-size: ${({ theme }) => theme.font.size.body};
    margin-top: 4px;
  }
  p {
    font-size: ${({ theme }) => theme.font.size.small};
    line-height: 1.7;
    max-width: 170px;
  }
`;
const Spinner = styled(LoaderCircle)`
  animation: ${spin} 1.5s linear infinite;
`;
export function EmptyState({ busy = false }: { busy?: boolean }) {
  return (
    <Landscape>
      <Hill />
      <Overlay>
        <span>{busy ? <Spinner size={24} /> : <Film size={24} />}</span>
        <strong>{busy ? 'A story is taking shape.' : 'Your next little story.'}</strong>
        <p>
          {busy
            ? 'We’re putting the pieces together. You can follow along on the left.'
            : 'Start with an idea. We’ll take it from here.'}
        </p>
      </Overlay>
    </Landscape>
  );
}
