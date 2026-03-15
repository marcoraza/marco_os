// components/learning/KnowledgeGraph.tsx
// Interactive knowledge map using HTML Canvas — Sprint D
// Simple force-directed layout, no external libs

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useNotionData } from '@/contexts/NotionDataContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

// ─── Raw item types ───────────────────────────────────────────────────────────

interface RawResearchItem {
  _id: string;
  _url?: string;
  Name?: string;
}

interface RawCriadorItem {
  _id: string;
  _url?: string;
  Handle?: string;
  Name?: string;
}

interface RawProjetoItem {
  _id: string;
  _url?: string;
  Name?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractItems<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw) && raw.length > 0 && (raw[0] as Record<string, unknown>)?._meta) {
    return ((raw[0] as Record<string, unknown>).items ?? []) as T[];
  }
  if (!Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  }
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function truncateLabel(s: string, max = 18): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

// ─── Graph types ──────────────────────────────────────────────────────────────

type NodeType = 'research' | 'criador' | 'projeto';

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  url?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_RADIUS = 7;
const NODE_COLORS: Record<NodeType, string> = {
  research: '#00B96B', // green
  criador: '#0A84FF',  // blue
  projeto: '#FF9F0A',  // orange
};
const NODE_GLOW: Record<NodeType, string> = {
  research: 'rgba(0,185,107,0.3)',
  criador: 'rgba(10,132,255,0.3)',
  projeto: 'rgba(255,159,10,0.3)',
};

const MAX_NODES = 100;
const CANVAS_HEIGHT = 400;

// ─── Physics ──────────────────────────────────────────────────────────────────

function simulateStep(nodes: GraphNode[], width: number, height: number): void {
  const cx = width / 2;
  const cy = height / 2;
  const n = nodes.length;

  for (let i = 0; i < n; i++) {
    const a = nodes[i];

    // Attraction to center
    a.vx += (cx - a.x) * 0.003;
    a.vy += (cy - a.y) * 0.003;

    // Repulsion between all pairs
    for (let j = i + 1; j < n; j++) {
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distSq = dx * dx + dy * dy || 0.01;
      const dist = Math.sqrt(distSq);
      const force = 2000 / distSq;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Damping
    a.vx *= 0.82;
    a.vy *= 0.82;

    // Integrate
    a.x += a.vx;
    a.y += a.vy;

    // Clamp to canvas bounds
    const pad = NODE_RADIUS + 4;
    a.x = Math.max(pad, Math.min(width - pad, a.x));
    a.y = Math.max(pad, Math.min(height - pad, a.y));
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TooltipState {
  node: GraphNode;
  cx: number; // canvas-space coords
  cy: number;
}

export function KnowledgeGraph({ className }: { className?: string }) {
  const { research, criadores, projetos } = useNotionData();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const rafRef = useRef<number | null>(null);
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(800);

  // Build initial nodes from data
  const buildNodes = useCallback(
    (width: number): GraphNode[] => {
      const nodes: GraphNode[] = [];

      const researchItems = extractItems<RawResearchItem>(research.items);
      researchItems.slice(0, 40).forEach(item => {
        nodes.push({
          id: `r-${item._id}`,
          label: truncateLabel(item.Name || 'Research'),
          type: 'research',
          url: item._url,
          x: Math.random() * (width - 40) + 20,
          y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
          vx: 0,
          vy: 0,
        });
      });

      const criadorItems = extractItems<RawCriadorItem>(criadores.items);
      criadorItems.slice(0, 30).forEach(item => {
        nodes.push({
          id: `c-${item._id}`,
          label: truncateLabel(item.Handle || item.Name || 'Criador'),
          type: 'criador',
          url: item._url,
          x: Math.random() * (width - 40) + 20,
          y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
          vx: 0,
          vy: 0,
        });
      });

      const projetoItems = extractItems<RawProjetoItem>(projetos.items);
      projetoItems.slice(0, 30).forEach(item => {
        nodes.push({
          id: `p-${item._id}`,
          label: truncateLabel(item.Name || 'Projeto'),
          type: 'projeto',
          url: item._url,
          x: Math.random() * (width - 40) + 20,
          y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
          vx: 0,
          vy: 0,
        });
      });

      return nodes.slice(0, MAX_NODES);
    },
    [research.items, criadores.items, projetos.items]
  );

  // Total node count for empty-state check
  const totalCount = useMemo(() => {
    const r = extractItems<RawResearchItem>(research.items).length;
    const c = extractItems<RawCriadorItem>(criadores.items).length;
    const p = extractItems<RawProjetoItem>(projetos.items).length;
    return r + c + p;
  }, [research.items, criadores.items, projetos.items]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 800;
      setCanvasWidth(Math.floor(w));
    });

    observer.observe(container);
    setCanvasWidth(container.clientWidth || 800);
    return () => observer.disconnect();
  }, []);

  // Reinit nodes when data or width changes
  useEffect(() => {
    nodesRef.current = buildNodes(canvasWidth);
  }, [buildNodes, canvasWidth]);

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes = nodesRef.current;
    const w = canvas.width;
    const h = canvas.height;
    const z = zoomRef.current;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#1C1C1C';
    ctx.fillRect(0, 0, w, h);

    // Apply zoom transform centered on canvas center
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(z, z);
    ctx.translate(-w / 2, -h / 2);

    for (const node of nodes) {
      const { x, y } = node;
      const color = NODE_COLORS[node.type];
      const glow = NODE_GLOW[node.type];

      // Glow
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;

      // Circle
      ctx.beginPath();
      ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = '#2A2A2A';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#8E8E93';
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.label, x, y + NODE_RADIUS + 3);
    }

    ctx.restore();
  }, []);

  // Animation loop
  const tick = useCallback(() => {
    simulateStep(nodesRef.current, canvasWidth, CANVAS_HEIGHT);
    draw();
    rafRef.current = requestAnimationFrame(tick);
  }, [draw, canvasWidth]);

  useEffect(() => {
    if (isCollapsed || totalCount < 3) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [tick, isCollapsed, totalCount]);

  // Click handler — convert to world coords
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      const z = zoomRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      // Invert zoom transform: world = (screen - center) / zoom + center
      const worldX = (mx - cx) / z + cx;
      const worldY = (my - cy) / z + cy;

      const hit = nodesRef.current.find(n => {
        const dx = n.x - worldX;
        const dy = n.y - worldY;
        return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS + 4;
      });

      if (hit) {
        // Convert node world pos back to canvas pos for tooltip positioning
        const screenX = (hit.x - cx) * z + cx;
        const screenY = (hit.y - cy) * z + cy;
        setTooltip({ node: hit, cx: screenX, cy: screenY });
      } else {
        setTooltip(null);
      }
    },
    []
  );

  const handleZoomIn = () => {
    const v = Math.min(zoomRef.current + 0.25, 3);
    zoomRef.current = v;
    setZoom(v);
    setTooltip(null);
  };

  const handleZoomOut = () => {
    const v = Math.max(zoomRef.current - 0.25, 0.3);
    zoomRef.current = v;
    setZoom(v);
    setTooltip(null);
  };

  const handleReset = () => {
    zoomRef.current = 1;
    setZoom(1);
    setTooltip(null);
    nodesRef.current = buildNodes(canvasWidth);
  };

  // Fallback when too few nodes
  if (totalCount < 3) {
    return (
      <EmptyState
        icon="hub"
        title="Dados insuficientes para o mapa"
        description="Adicione pelo menos 3 itens entre research, criadores e projetos."
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Collapsible header */}
      <div className="flex items-center justify-between">
        <SectionLabel>Mapa de Conhecimento ({Math.min(totalCount, MAX_NODES)} nós)</SectionLabel>
        <button
          onClick={() => setIsCollapsed(c => !c)}
          className="text-[8px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 min-h-[44px] px-2 focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        >
          <Icon name={isCollapsed ? 'expand_more' : 'expand_less'} size="xs" />
          {isCollapsed ? 'Expandir' : 'Recolher'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Controls + legend */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleZoomIn}
              className="text-[8px] font-bold px-2 py-1 bg-surface border border-border-panel rounded-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] w-9 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
              aria-label="Ampliar"
            >
              <Icon name="add" size="xs" />
            </button>
            <button
              onClick={handleZoomOut}
              className="text-[8px] font-bold px-2 py-1 bg-surface border border-border-panel rounded-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] w-9 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
              aria-label="Reduzir"
            >
              <Icon name="remove" size="xs" />
            </button>
            <button
              onClick={handleReset}
              className="text-[9px] font-bold px-3 py-1 bg-surface border border-border-panel rounded-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
            >
              Reset
            </button>
            <span className="text-[8px] font-mono text-text-secondary ml-1">
              {Math.round(zoom * 100)}%
            </span>

            {/* Legend */}
            <div className="flex items-center gap-3 ml-auto">
              {(['research', 'criador', 'projeto'] as NodeType[]).map(type => (
                <div key={type} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: NODE_COLORS[type] }}
                  />
                  <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary">
                    {type === 'criador' ? 'Criadores' : type === 'projeto' ? 'Projetos' : 'Research'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas wrapper */}
          <div
            ref={containerRef}
            className="relative bg-surface border border-border-panel rounded-sm overflow-hidden"
            style={{ height: CANVAS_HEIGHT }}
          >
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={CANVAS_HEIGHT}
              className="w-full h-full"
              style={{ cursor: 'crosshair', display: 'block' }}
              onClick={handleCanvasClick}
              aria-label="Mapa de conhecimento interativo"
            />

            {/* Tooltip */}
            {tooltip && (() => {
              const canvas = canvasRef.current;
              const rect = canvas?.getBoundingClientRect();
              const scaleX = rect && canvas ? rect.width / canvas.width : 1;
              const scaleY = rect && canvas ? rect.height / canvas.height : 1;
              const tipX = tooltip.cx * scaleX;
              const tipY = tooltip.cy * scaleY;
              return (
                <div
                  className="absolute bg-surface border border-border-panel rounded-sm px-3 py-2 pointer-events-none z-10 max-w-[200px] shadow-md"
                  style={{
                    left: Math.min(tipX + 12, (rect?.width ?? 600) - 210),
                    top: Math.max(tipY - 40, 4),
                  }}
                >
                  <p className="text-xs font-bold text-text-primary leading-tight">
                    {tooltip.node.label}
                  </p>
                  <p className="text-[8px] text-text-secondary font-bold uppercase tracking-widest mt-0.5">
                    {tooltip.node.type === 'criador'
                      ? 'Criador'
                      : tooltip.node.type === 'projeto'
                      ? 'Projeto'
                      : 'Research'}
                  </p>
                  {tooltip.node.url && (
                    <a
                      href={tooltip.node.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[8px] text-brand-mint hover:underline pointer-events-auto mt-1 block focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
                      onClick={e => e.stopPropagation()}
                    >
                      Abrir no Notion
                    </a>
                  )}
                </div>
              );
            })()}
          </div>

          <p className="text-[7px] font-mono text-text-secondary">
            Clique em um nó para ver detalhes · Simulação em tempo real
          </p>
        </>
      )}
    </div>
  );
}
