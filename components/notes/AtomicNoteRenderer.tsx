import React, { useState } from 'react';
import { cn } from '../../utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WikiLinkProps {
  term: string;
  onClick?: (term: string) => void;
}

// ─── WikiLink component ───────────────────────────────────────────────────────
const WikiLink: React.FC<WikiLinkProps> = ({ term, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className={cn(
          'text-brand-mint cursor-pointer hover:underline',
          'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
          'rounded-sm inline',
        )}
        onClick={() => onClick?.(term)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`Nota: ${term}`}
      >
        {term}
      </button>
      {showTooltip && (
        <span
          className="absolute bottom-full left-0 mb-1 z-10 pointer-events-none"
          role="tooltip"
        >
          <span className="bg-surface border border-border-panel text-[9px] px-2 py-1 rounded-sm whitespace-nowrap text-text-secondary font-mono">
            Nota: {term}
          </span>
        </span>
      )}
    </span>
  );
};

// ─── Inline token types ───────────────────────────────────────────────────────
type Token =
  | { type: 'text'; value: string }
  | { type: 'wiki'; term: string }
  | { type: 'bold'; content: string }
  | { type: 'italic'; content: string }
  | { type: 'code'; content: string }
  | { type: 'link'; text: string; href: string };

// ─── Tokenizer ────────────────────────────────────────────────────────────────
function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  // Combined regex — order matters: wiki > link > bold > italic > code
  const pattern =
    /\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Push plain text before match
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      // Wiki link: [[term]]
      tokens.push({ type: 'wiki', term: match[1] });
    } else if (match[2] !== undefined && match[3] !== undefined) {
      // Markdown link: [text](href)
      tokens.push({ type: 'link', text: match[2], href: match[3] });
    } else if (match[4] !== undefined) {
      // Bold: **text**
      tokens.push({ type: 'bold', content: match[4] });
    } else if (match[5] !== undefined) {
      // Italic: *text*
      tokens.push({ type: 'italic', content: match[5] });
    } else if (match[6] !== undefined) {
      // Inline code: `text`
      tokens.push({ type: 'code', content: match[6] });
    }

    lastIndex = pattern.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
}

// ─── Render tokens to React nodes ─────────────────────────────────────────────
function renderTokens(tokens: Token[], onClick?: (term: string) => void): React.ReactNode {
  return tokens.map((token, i) => {
    switch (token.type) {
      case 'text':
        return <React.Fragment key={i}>{token.value}</React.Fragment>;
      case 'wiki':
        return <WikiLink key={i} term={token.term} onClick={onClick} />;
      case 'bold':
        return <strong key={i} className="font-bold">{token.content}</strong>;
      case 'italic':
        return <em key={i} className="italic">{token.content}</em>;
      case 'code':
        return (
          <code
            key={i}
            className="bg-bg-base border border-border-panel rounded-sm px-1.5 py-0.5 text-xs font-mono"
          >
            {token.content}
          </code>
        );
      case 'link':
        return (
          <a
            key={i}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue underline hover:text-accent-blue/80 focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none rounded-sm"
          >
            {token.text}
          </a>
        );
      default:
        return null;
    }
  });
}

// ─── Public API: renderWithLinks ──────────────────────────────────────────────

/**
 * Renders text with [[wiki-link]], **bold**, *italic*, `code`, and [link](url) support.
 * Wiki links are rendered as clickable mint-colored buttons.
 */
export function renderWithLinks(
  text: string,
  onClick?: (term: string) => void,
): React.ReactNode {
  if (!text) return null;
  const tokens = tokenize(text);
  return renderTokens(tokens, onClick);
}

// ─── AtomicNoteRenderer component ────────────────────────────────────────────
interface AtomicNoteRendererProps {
  content: string;
  onWikiLinkClick?: (term: string) => void;
  className?: string;
}

export const AtomicNoteRenderer: React.FC<AtomicNoteRendererProps> = ({
  content,
  onWikiLinkClick,
  className,
}) => {
  if (!content) return null;

  // Split by lines to preserve structure
  const lines = content.split('\n');

  return (
    <div className={cn('text-sm text-text-primary leading-relaxed', className)}>
      {lines.map((line, i) => (
        <div key={i} className={line === '' ? 'h-2' : undefined}>
          {line !== '' && renderWithLinks(line, onWikiLinkClick)}
        </div>
      ))}
    </div>
  );
};

export default AtomicNoteRenderer;
