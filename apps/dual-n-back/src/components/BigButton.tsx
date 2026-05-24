import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  pressed?: boolean;
  ariaLabel?: string;
  hotkey?: string;
}

export default function BigButton({ children, onClick, primary, disabled, pressed, ariaLabel, hotkey }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        flex: 1,
        position: 'relative',
        background: primary ? 'var(--accent)' : 'var(--surface)',
        color: primary ? 'var(--accent-fg)' : 'var(--fg)',
        border: '1px solid var(--border)',
        borderRadius: 999,
        padding: '18px 0',
        fontSize: '1rem',
        fontWeight: 600,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        transition: 'transform 80ms ease, opacity 80ms ease',
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
            background: primary ? 'rgba(0,0,0,0.15)' : 'var(--surface-deep)',
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
