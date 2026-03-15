// contexts/ProjectContext.tsx
// Global project context for section-level filtering.
// null = "Pessoal" mode (all sections visible).
// When a project is active, AppSidebar filters nav based on visibleSections.
import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Default sections visible for every project (minimum set)
export const DEFAULT_PROJECT_SECTIONS = ['dashboard', 'planner', 'agents-overview', 'settings'];

// All sections available in "Pessoal" mode
export const ALL_SECTIONS = [
  'dashboard',
  'finance',
  'health',
  'learning',
  'planner',
  'notes',
  'crm',
  'agents-overview',
  'settings',
];

export interface ActiveProject {
  id: string;
  name: string;
  color?: string;
  visibleSections: string[];
}

interface ProjectContextValue {
  activeProject: ActiveProject | null;
  setActiveProject: (project: ActiveProject | null) => void;
  isPersonal: boolean;
  visibleSections: string[];
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null);

  const value = useMemo<ProjectContextValue>(() => ({
    activeProject,
    setActiveProject,
    isPersonal: activeProject === null,
    visibleSections: activeProject ? activeProject.visibleSections : ALL_SECTIONS,
  }), [activeProject]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProjectContext must be used inside <ProjectProvider>');
  }
  return ctx;
}
