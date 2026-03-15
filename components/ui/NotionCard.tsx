import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { SourceBadge } from '@/components/ui/SourceBadge';

interface NotionCardProps {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
  source?: 'notion' | 'local';
  href?: string;
  children?: ReactNode;
  className?: string;
}

export function NotionCard({ title, meta, actions, source, href, children, className }: NotionCardProps) {
  return (
    <div className={cn('bg-surface border border-border-panel rounded-sm p-3 transition-all', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-text-primary truncate">{title}</span>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-brand-mint hover:text-brand-mint/80 transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
              aria-label="Abrir link externo"
            >
              <Icon name="open_in_new" size="xs" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {source && <SourceBadge source={source} />}
          {actions}
        </div>
      </div>
      {meta && <div className="mt-1 flex flex-wrap gap-2">{meta}</div>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
