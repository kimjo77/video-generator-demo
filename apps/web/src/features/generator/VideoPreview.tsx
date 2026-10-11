import { ArrowDownToLine, Check, Maximize2 } from 'lucide-react';
import styled from 'styled-components';
import type { GenerationJob } from '@frame/shared';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
const PreviewCard = styled(Card)`
  padding: ${({ theme }) => theme.space.panel};
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  h2 {
    font-size: ${({ theme }) => theme.font.size.label};
    margin: 0;
    font-weight: 650;
  }
`;
const Screen = styled.div`
  width: min(100%, 292px);
  aspect-ratio: 9 / 16;
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;
  position: relative;
  background: #efe5d9;
  video {
    width: 100%;
    height: 100%;
    display: block;
    background: #151515;
  }
`;
const Format = styled.span`
  position: absolute;
  bottom: 14px;
  right: 14px;
  font-size: ${({ theme }) => theme.font.size.xs};
  color: white;
  border-radius: 5px;
  background: #0006;
  padding: 5px 7px;
  display: flex;
  gap: 5px;
  align-items: center;
`;
const Details = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.font.size.caption};
  margin: 18px 0 2px;
`;
const DownloadButton = styled(Button)`
  text-decoration: none;
`;
const Result = styled.div`
  width: 100%;
  margin-top: 20px;
  h3 {
    font-size: ${({ theme }) => theme.font.size.subheading};
    line-height: 1.5;
    margin-bottom: 14px;
  }
  p {
    color: ${({ theme }) => theme.colors.muted};
    font-size: ${({ theme }) => theme.font.size.small};
    line-height: 1.7;
    margin: 14px 0 0;
  }
`;
const Credits = styled.details`
  width: 100%;
  font-size: ${({ theme }) => theme.font.size.small};
  margin-top: 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 16px;
  summary {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.muted};
  }
  ul {
    padding-left: 18px;
    line-height: 1.9;
  }
`;
export function VideoPreview({ job, busy }: { job: GenerationJob | null; busy: boolean }) {
  const result = job?.status === 'completed' ? job.result : undefined;
  return (
    <PreviewCard aria-label="Video preview">
      <Top>
        <h2>Your canvas</h2>
        <StatusBadge $tone={result ? 'ready' : busy ? 'working' : 'neutral'}>
          {result ? 'Ready to share' : busy ? 'In production' : 'Preview'}
        </StatusBadge>
      </Top>
      <Screen>
        {result ? (
          <video
            key={result.videoUrl}
            src={result.videoUrl}
            controls
            playsInline
            preload="metadata"
            aria-label={result.title}
          />
        ) : (
          <>
            <EmptyState busy={busy} />
            <Format>
              <Maximize2 size={10} />
              9:16
            </Format>
          </>
        )}
      </Screen>
      <Details>
        {result ? <Check size={12} /> : null}720 × 1280 <span>·</span>{' '}
        {result ? `${result.duration.toFixed(1)} sec` : 'Vertical video'} <span>·</span> MP4
      </Details>
      {result && (
        <Result>
          <h3>{result.title}</h3>
          <DownloadButton as="a" href={result.downloadUrl} $full>
            <ArrowDownToLine size={16} />
            Download MP4
          </DownloadButton>
          <p>Narration is AI-generated. Review the video’s content before sharing.</p>
          <Credits>
            <summary>Photo credits · Pixabay</summary>
            <ul>
              {result.credits.map((credit) => (
                <li key={credit.scene}>
                  Scene {credit.scene}:{' '}
                  <a href={credit.photographerUrl} target="_blank" rel="noreferrer">
                    {credit.photographer}
                  </a>{' '}
                  ·{' '}
                  <a href={credit.photoUrl} target="_blank" rel="noreferrer">
                    View photo
                  </a>
                </li>
              ))}
              {result.fallbackScenes.map((scene) => (
                <li key={scene}>Scene {scene}: text and color (no matching photo).</li>
              ))}
            </ul>
            <a href="https://pixabay.com" target="_blank" rel="noreferrer">
              Image search powered by Pixabay
            </a>
          </Credits>
        </Result>
      )}
    </PreviewCard>
  );
}
