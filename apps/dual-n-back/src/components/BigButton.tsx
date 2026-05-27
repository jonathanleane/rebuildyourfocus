import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  pressed?: boolean;
  ariaLabel?: string;
  hotkey?: string;
  feedback?: 'correct' | 'wrong';
}

export default function BigButton({ children, onClick, primary, disabled, pressed, ariaLabel, hotkey, feedback }: Props) {
  const background = feedback === 'correct'
    ? 'var(--success)'
    : feedback === 'wrong'
    ? 'var(--danger)'
    : primary
    ? 'var(--accent)'
    : 'var(--surface)';
  const color = feedback ? '#fff' : primary ? 'var(--accent-fg)' : 'var(--fg)';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        flex: 1,
        position: 'relative',
        background,
        color,
        border: '1px solid var(--border)',
        borderRadius: 999,
        padding: '18px 0',
        fontSize: '1rem',
        fontWeight: 600,
        opacity: disabled ? 0.4 : pressed && !feedback ? 0.7 : 1,
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        transition: 'transform 80ms ease, opacity 80ms ease, background 120ms ease',
      }}
    >
      {children}
      {hotkey && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.65rem',
            fontWeight: 600,
            padding: '3px 7px',
            borderRadius: 6,
            background: primary || feedback ? 'rgba(0,0,0,0.15)' : 'var(--surface-deep)',
            color: 'currentColor',
            opacity: 0.7,
            letterSpacing: '0.04em',
          }}
        >
          {hotkey}
        </span>
      )}
    </button>
  );
}
