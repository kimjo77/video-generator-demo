import { Check } from 'lucide-react';
import styled from 'styled-components';
import type { GenerationJob } from '@frame/shared';
const List = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: ${({ theme }) => theme.space.lg};
`;
const Step = styled.li`
  display: flex;
  gap: 14px;
  align-items: flex-start;
`;
const Number = styled.span<{ $active: boolean; $complete: boolean }>`
  display: grid;
  place-items: center;
  flex: 0 0 34px;
  height: 34px;
  border-radius: 50%;
  font-size: ${({ theme }) => theme.font.size.small};
  background: ${({ theme, $active, $complete }) => ($complete ? theme.colors.accent : $active ? theme.colors.accentSoft : theme.colors.canvas)};
  color: ${({ theme, $complete, $active }) => ($complete ? theme.colors.onAccent : $active ? theme.colors.accent : theme.colors.muted)};
  box-shadow: ${({ theme, $active }) => ($active ? `0 0 0 1px ${theme.colors.accent}` : 'none')};
`;
const Text = styled.div`
  padding-top: 2px;
  strong {
    font-size: ${({ theme }) => theme.font.size.label};
    font-weight: 650;
  }
  p {
    color: ${({ theme }) => theme.colors.muted};
    font-size: ${({ theme }) => theme.font.size.small};
    line-height: 1.6;
    margin: 5px 0 0;
  }
`;
const steps = [
  { title: 'Shape the story', description: 'A short script, told in three scenes.' },
  { title: 'Bring it to life', description: 'Stock imagery and an AI-generated voice.' },
  { title: 'Make it a video', description: 'Motion, captions, and a downloadable MP4.' },
];
export function ProgressSteps({ job }: { job: GenerationJob | null }) {
  const current = !job
    ? -1
    : job.stage === 'complete'
      ? 3
      : job.stage === 'render'
        ? 2
        : ['images', 'voice'].includes(job.stage)
          ? 1
          : 0;
  return (
    <List aria-label="Production stages">
      {steps.map((step, i) => (
        <Step key={step.title} aria-current={current === i ? 'step' : undefined}>
          <Number $active={current === i && job?.status !== 'failed'} $complete={current > i}>
            {current > i ? <Check size={15} /> : `0${i + 1}`}
          </Number>
          <Text>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
          </Text>
        </Step>
      ))}
    </List>
  );
}
