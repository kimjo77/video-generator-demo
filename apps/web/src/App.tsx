import { TOPIC_MIN_LENGTH } from '@frame/shared';
import { useState } from 'react';
import {
  ArrowRight,
  AudioLines,
  Clapperboard,
  Film,
  Leaf,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import styled from 'styled-components';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { TextField } from './components/TextField';
import { StatusBadge } from './components/StatusBadge';
import { ProgressSteps } from './components/ProgressSteps';
import { VideoPreview } from './features/generator/VideoPreview';
import { useGenerator } from './features/generator/useGenerator';
const Page = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 40px;
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0 20px;
  }
`;
const Header = styled.header`
  height: 96px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const Brand = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.ink};
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: ${({ theme }) => theme.font.size.brand};
  font-weight: 750;
  letter-spacing: -1px;
`;
const BrandAccent = styled.span`
  color: ${({ theme }) => theme.colors.accent};
`;
const Mark = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
`;
const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  > span:first-child {
    color: ${({ theme }) => theme.colors.muted};
    font-size: ${({ theme }) => theme.font.size.small};
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    > span:first-child {
      display: none;
    }
  }
`;
const Main = styled.main`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 80px;
  padding: 56px 0 48px;
  align-items: start;
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: 32px;
    grid-template-columns: minmax(0, 1fr) 320px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.stacked}) {
    grid-template-columns: 1fr;
    padding-top: 36px;
    > section:last-child {
      max-width: 420px;
      width: 100%;
      justify-self: center;
    }
  }
`;
const Eyebrow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: 700;
  letter-spacing: 1.7px;
  margin: 6px 0 22px;
`;
const Heading = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.font.size.hero};
  letter-spacing: -2.6px;
  line-height: 1.09;
  font-weight: 600;
  margin-bottom: 20px;
  span {
    color: ${({ theme }) => theme.colors.accent};
  }
`;
const Intro = styled.p`
  max-width: 430px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.font.size.body};
  line-height: 1.8;
  margin-bottom: 28px;
`;
const FormCard = styled(Card)`
  padding: ${({ theme }) => theme.space.panel};
  border-radius: ${({ theme }) => theme.radius.md};
`;
const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  font-size: ${({ theme }) => theme.font.size.caption};
  margin: 16px 0 22px;
  color: ${({ theme }) => theme.colors.muted};
`;
const Suggestion = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.font.size.caption};
  padding: 7px 9px;
  border-radius: ${({ theme }) => theme.radius.pill};
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
  &:disabled {
    opacity: 0.5;
  }
`;
const FormNote = styled.p`
  font-size: ${({ theme }) => theme.font.size.xs};
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  margin: 12px 0 0;
`;
const Setup = styled.div`
  background: ${({ theme }) => theme.colors.accentSoft};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 13px;
  margin-bottom: 18px;
  font-size: ${({ theme }) => theme.font.size.small};
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.ink};
  strong {
    display: block;
    margin-bottom: 3px;
  }
  p {
    margin-bottom: 10px;
    overflow-wrap: anywhere;
  }
  button {
    min-height: 34px;
    font-size: ${({ theme }) => theme.font.size.caption};
    padding: 6px 10px;
  }
`;
const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.font.size.small};
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.danger};
  padding: 12px;
  background: ${({ theme }) => theme.colors.accentSoft};
  border-radius: ${({ theme }) => theme.radius.sm};
  margin: 12px 0;
`;
const Production = styled.div`
  margin-top: 30px;
  padding: 0 5px;
`;
const SectionLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  > span:first-child {
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.muted};
    font-size: ${({ theme }) => theme.font.size.xs};
    letter-spacing: 1.3px;
    font-weight: 650;
  }
`;
const StageText = styled.p`
  font-size: ${({ theme }) => theme.font.size.small};
  color: ${({ theme }) => theme.colors.accent};
  margin: 20px 0 0;
  line-height: 1.6;
`;
const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 24px 0 30px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.font.size.xs};
  line-height: 1.7;
  > div {
    display: flex;
    gap: 17px;
    flex-wrap: wrap;
  }
  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
const labels = {
  queued: 'Getting your workspace ready…',
  script: 'Writing a three-scene story…',
  images: 'Finding the right photographs…',
  voice: 'Recording your AI narration…',
  render: 'Rendering motion and captions…',
  complete: 'Your story is ready. Make it yours.',
};
export default function App() {
  const [topic, setTopic] = useState('');
  const { health, healthLoading, job, busy, error, generate, refreshHealth } = useGenerator();
  const ready = health?.status === 'ready';
  const failed = job?.status === 'failed';
  return (
    <Page>
      <Header>
        <Brand href="/" aria-label="Frame home">
          <Mark>
            <Clapperboard size={19} />
          </Mark>
          frame<BrandAccent>.</BrandAccent>
        </Brand>
        <HeaderRight>
          <span>A small studio for big ideas</span>
          <StatusBadge $tone={ready ? 'ready' : 'neutral'}>
            {healthLoading ? 'Connecting' : ready ? 'Studio ready' : 'Local studio'}
          </StatusBadge>
        </HeaderRight>
      </Header>
      <Main>
        <section aria-label="Video creation">
          <Eyebrow>
            <Sparkles size={13} />
            FROM THOUGHT TO FRAME
          </Eyebrow>
          <Heading>
            A little idea.
            <br />A <span>moving story.</span>
          </Heading>
          <Intro>
            Turn something you’re curious about into a short, narrated video. Three scenes. One
            idea. All put together for you.
          </Intro>
          <FormCard>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void generate(topic);
              }}
            >
              <TextField
                label="What’s your story about?"
                placeholder="Why do leaves change color?"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                required
                minLength={TOPIC_MIN_LENGTH}
                disabled={busy}
                hint="A question, a concept, a little curiosity."
              />
              <Suggestions>
                <span>Try an idea</span>
                {[
                  { label: 'The secret life of bees', topic: 'How do bees help our planet?' },
                  { label: 'A sky full of color', topic: 'Why do sunsets turn the sky orange?' },
                ].map((example) => (
                  <Suggestion
                    key={example.topic}
                    type="button"
                    onClick={() => setTopic(example.topic)}
                    disabled={busy}
                  >
                    {example.label}
                  </Suggestion>
                ))}
              </Suggestions>
              {!healthLoading && !ready && (
                <Setup>
                  <strong>Let’s connect your studio.</strong>
                  <p>
                    {health
                      ? `Add ${health.missing.join(', ')} to your backend configuration, then restart the API.`
                      : 'Start the backend on localhost:8000 to connect your studio.'}
                  </p>
                  <Button
                    type="button"
                    $variant="secondary"
                    onClick={() => {
                      void refreshHealth();
                    }}
                    disabled={healthLoading}
                  >
                    <RefreshCw size={12} />
                    Check connection
                  </Button>
                </Setup>
              )}
              <Button type="submit" $full disabled={busy || !ready || healthLoading}>
                {busy ? (
                  <>
                    <LoaderCircle size={16} />
                    Creating your video…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    {failed || (error && ready) ? 'Try again' : 'Create my video'}
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
              <FormNote>3 scenes · AI narration · Captions · 9:16 MP4</FormNote>
              {(error || job?.error) && (
                <ErrorMessage role="alert">{error || job?.error}</ErrorMessage>
              )}
            </form>
          </FormCard>
          <Production>
            <SectionLabel>
              <span>A little production magic</span>
              <StatusBadge
                $tone={
                  failed
                    ? 'error'
                    : busy
                      ? 'working'
                      : job?.status === 'completed'
                        ? 'ready'
                        : 'neutral'
                }
              >
                {failed
                  ? 'Needs attention'
                  : busy
                    ? 'Working'
                    : job?.status === 'completed'
                      ? 'Complete'
                      : 'Automatic'}
              </StatusBadge>
            </SectionLabel>
            <ProgressSteps job={job} />
            <div role="status" aria-live="polite">
              {job && !failed && <StageText>{labels[job.stage]}</StageText>}
            </div>
          </Production>
        </section>
        <VideoPreview job={job} busy={busy} />
      </Main>
      <Footer>
        <span>Made for curiosity. Built to keep things simple.</span>
        <div>
          <span>
            <Film size={12} />
            Stock imagery
          </span>
          <span>
            <AudioLines size={12} />
            AI-generated narration
          </span>
          <span>
            <Leaf size={12} />
            One idea at a time
          </span>
        </div>
      </Footer>
    </Page>
  );
}
