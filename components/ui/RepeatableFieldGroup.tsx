import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

interface RepeatableFieldGroupProps {
  itemLabel: string;
  items: Record<string, unknown>[];
  renderItem: (
    item: Record<string, unknown>,
    index: number,
    onChange: (field: string, value: unknown) => void
  ) => React.ReactNode;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onItemChange: (index: number, field: string, value: unknown) => void;
  minItems: number;
  maxItems: number;
  addLabel: string;
  className?: string;
}

export function RepeatableFieldGroup({
  itemLabel,
  items,
  renderItem,
  onAddItem,
  onRemoveItem,
  onItemChange,
  minItems,
  maxItems,
  addLabel,
  className,
}: RepeatableFieldGroupProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(
    items.length > 0 ? items.length - 1 : 0
  );

  const canAdd = items.length < maxItems;
  const canRemove = items.length > minItems;

  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence initial={false}>
        {items.map((item, index) => {
          const isExpanded = expandedIndex === index;
          const itemTitle =
            (item.name as string) || `${itemLabel} ${index + 1}`;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-header-bg border border-border-panel rounded-sm overflow-hidden"
            >
              {/* Header (always visible) */}
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Recolher' : 'Expandir'} ${itemTitle}`}
                onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-hover transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                  {itemTitle}
                </span>
                <div className="flex items-center gap-2">
                  {canRemove && (
                    <span
                      role="button"
                      aria-label={`Remover ${itemTitle}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(index);
                      }}
                      className="text-text-secondary hover:text-accent-red transition-colors p-1 cursor-pointer"
                    >
                      <Icon name="delete" size="xs" />
                    </span>
                  )}
                  <Icon
                    name={isExpanded ? 'expand_less' : 'expand_more'}
                    size="sm"
                    className="text-text-secondary"
                  />
                </div>
              </button>

              {/* Body (collapsible) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border-panel"
                  >
                    <div className="p-4 space-y-3">
                      {renderItem(item, index, (field, value) =>
                        onItemChange(index, field, value)
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Add button */}
      {canAdd && (
        <button
          type="button"
          onClick={() => {
            onAddItem();
            setExpandedIndex(items.length);
          }}
          className="w-full py-2 border border-dashed border-border-panel rounded-sm text-[9px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors flex items-center justify-center gap-1"
        >
          <Icon name="add" size="xs" />
          {addLabel}
        </button>
      )}

      {/* Counter */}
      <p className="text-[9px] font-mono text-text-secondary text-right">
        {items.length} de {maxItems}
      </p>
    </div>
  );
}
