import ReactMarkdown from 'react-markdown';
import literatureReview from '../content/literature-review.md?raw';

interface Props {
  onBack: () => void;
}

export default function ScienceScreen({ onBack }: Props) {
  return (
    <>
      <button onClick={onBack} style={{ color: 'var(--fg-dim)', fontSize: '0.85rem', alignSelf: 'flex-start', marginBottom: 12 }}>
        ‹ Back
      </button>

      <article
        style={{
          fontSize: '0.92rem',
          lineHeight: 1.6,
          color: 'var(--fg)',
        }}
      >
        <ReactMarkdown
          components={{
            h1: (props) => (
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8, marginTop: 0, letterSpacing: '-0.01em' }} {...props} />
            ),
            h2: (props) => (
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 28, marginBottom: 10 }} {...props} />
            ),
            h3: (props) => (
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 18, marginBottom: 6, color: 'var(--fg)' }} {...props} />
            ),
            p: (props) => (
              <p style={{ marginBottom: 12, color: 'var(--fg)' }} {...props} />
            ),
            ul: (props) => (
              <ul style={{ paddingLeft: 20, marginBottom: 12 }} {...props} />
            ),
            ol: (props) => (
              <ol style={{ paddingLeft: 20, marginBottom: 12 }} {...props} />
            ),
            li: (props) => (
              <li style={{ marginBottom: 4, color: 'var(--fg)' }} {...props} />
            ),
            strong: (props) => (
              <strong style={{ color: 'var(--fg)', fontWeight: 700 }} {...props} />
            ),
            em: (props) => (
              <em style={{ color: 'var(--fg-dim)' }} {...props} />
            ),
            a: (props) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              />
            ),
            blockquote: (props) => (
              <blockquote
                style={{
                  borderLeft: '3px solid var(--accent)',
                  paddingLeft: 12,
                  margin: '16px 0',
                  fontStyle: 'italic',
                  color: 'var(--fg-dim)',
                }}
                {...props}
              />
            ),
            hr: () => (
              <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '24px 0' }} />
            ),
            code: (props) => (
              <code
                style={{
                  background: 'var(--surface)',
                  padding: '1px 5px',
                  borderRadius: 4,
                  fontSize: '0.85em',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                }}
                {...props}
              />
            ),
          }}
        >
          {literatureReview}
        </ReactMarkdown>
      </article>

      <div style={{ marginTop: 24, padding: 12, background: 'var(--surface)', borderRadius: 12, fontSize: '0.75rem', color: 'var(--fg-dim)' }}>
        Source for this review:{' '}
        <a
          href="https://github.com/jonathanleane/rebuildyourfocus/blob/main/apps/dual-n-back/src/content/literature-review.md"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)' }}
        >
          literature-review.md on GitHub
        </a>
        . Spotted an error or a study we should add? Open an issue or PR.
      </div>
    </>
  );
}
