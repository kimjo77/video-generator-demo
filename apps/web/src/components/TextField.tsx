import { TOPIC_MAX_LENGTH } from '@frame/shared';
import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import styled from 'styled-components';
const Label = styled.label`
  display: block;
  font-weight: 650;
  font-size: ${({ theme }) => theme.font.size.body};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;
const Input = styled.textarea`
  display: block;
  width: 100%;
  resize: vertical;
  min-height: 116px;
  padding: 16px;
  line-height: 1.6;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.canvas};
  color: ${({ theme }) => theme.colors.ink};
  font-size: ${({ theme }) => theme.font.size.input};
  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;
const Hint = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.font.size.small};
  line-height: 1.5;
`;
interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  value: string;
}
export function TextField({ label, hint, value, maxLength = TOPIC_MAX_LENGTH, ...props }: Props) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        maxLength={maxLength}
        aria-describedby={`${id}-hint`}
        {...props}
      />
      <Hint id={`${id}-hint`}>
        <span>{hint}</span>
        <span>
          {value.length}/{maxLength}
        </span>
      </Hint>
    </div>
  );
}
