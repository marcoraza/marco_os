// Mission Control V2 — Bulk Actions Bar Component

import React from 'react';
import { cn } from '../../utils/cn';

interface BulkActionsBarProps {
  count: number;
  onKill: () => void;
  onArchive: () => void;
  onExport: () => void;
  onDeselectAll: () => void;
  isProcessing?: boolean;
}

export default function BulkActionsBar({
  count,
  onKill,
  onArchive,
  onExport,
  onDeselectAll,
  isProcessing = false
}: BulkActionsBarProps) {
  return (
    <div className="flex-shrink-0 px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-emerald-400">
          {count} agent{count > 1 ? 's' : ''} selected
        </span>
        
        <div className="h-4 w-px bg-emerald-500/30" />
        
        <div className="flex items-center gap-2">
          <button
            onClick={onKill}
            disabled={isProcessing}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded transition-colors',
              'bg-red-500/20 text-red-400 border border-red-500/30',
              'hover:bg-red-500/30 hover:border-red-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Kill selected agents (Cmd+K)"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Kill All
            </span>
          </button>

          <button
            onClick={onArchive}
            disabled={isProcessing}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded transition-colors',
              'bg-zinc-700 text-gray-300 border border-zinc-600',
              'hover:bg-zinc-600 hover:border-zinc-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Archive All
            </span>
          </button>

          <button
            onClick={onExport}
            disabled={isProcessing}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded transition-colors',
              'bg-zinc-700 text-gray-300 border border-zinc-600',
              'hover:bg-zinc-600 hover:border-zinc-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Logs
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs text-emerald-400/60">
          <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 font-mono">Cmd+A</kbd>
          <span className="mx-2">select all</span>
          <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 font-mono">Cmd+K</kbd>
          <span className="mx-2">kill</span>
          <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 font-mono">Esc</kbd>
          <span className="mx-2">deselect</span>
        </div>

        <button
          onClick={onDeselectAll}
          className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Clear Selection
        </button>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
