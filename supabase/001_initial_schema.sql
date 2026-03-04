-- ============================================================
-- Marco OS — Initial Schema Migration
-- 001_initial_schema.sql
-- Idempotent: safe to run multiple times
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- Helper: updated_at auto-trigger function
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────────
-- 1. tasks
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           text PRIMARY KEY,
  title        text,
  status       text,
  priority     text,
  project      text,
  assigned_to  text,
  due_date     timestamptz,
  description  text,
  notion_url   text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  synced_at    timestamptz
);

DROP TRIGGER IF EXISTS set_tasks_updated_at ON tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_tasks" ON tasks;
CREATE POLICY "service_role_all_tasks" ON tasks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 2. projects
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id               text PRIMARY KEY,
  title            text,
  status           text,
  description      text,
  stack            text,
  domain           text,
  notion_url       text,
  visible_sections text[],
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  synced_at        timestamptz
);

DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_projects" ON projects;
CREATE POLICY "service_role_all_projects" ON projects
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 3. meetings
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
  id           text PRIMARY KEY,
  title        text,
  date         timestamptz,
  participants text[],
  status       text,
  notes        text,
  notion_url   text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  synced_at    timestamptz
);

DROP TRIGGER IF EXISTS set_meetings_updated_at ON meetings;
CREATE TRIGGER set_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_date   ON meetings(date);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_meetings" ON meetings;
CREATE POLICY "anon_select_meetings" ON meetings
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_meetings" ON meetings;
CREATE POLICY "service_role_all_meetings" ON meetings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 4. research
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research (
  id         text PRIMARY KEY,
  title      text,
  platform   text,
  url        text,
  summary    text,
  status     text,
  creator    text,
  tags       text[],
  notion_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at  timestamptz
);

DROP TRIGGER IF EXISTS set_research_updated_at ON research;
CREATE TRIGGER set_research_updated_at
  BEFORE UPDATE ON research
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_research_status ON research(status);

ALTER TABLE research ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_research" ON research;
CREATE POLICY "anon_select_research" ON research
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_research" ON research;
CREATE POLICY "service_role_all_research" ON research
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 5. finance
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance (
  id          text PRIMARY KEY,
  title       text,
  value       numeric,
  type        text,
  category    text,
  date        timestamptz,
  recurring   boolean DEFAULT false,
  project     text,
  description text,
  notion_url  text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  synced_at   timestamptz
);

DROP TRIGGER IF EXISTS set_finance_updated_at ON finance;
CREATE TRIGGER set_finance_updated_at
  BEFORE UPDATE ON finance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_finance_date ON finance(date);

ALTER TABLE finance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_finance" ON finance;
CREATE POLICY "anon_select_finance" ON finance
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_finance" ON finance;
CREATE POLICY "service_role_all_finance" ON finance
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 6. health
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health (
  id           text PRIMARY KEY,
  title        text,
  date         timestamptz,
  type         text,
  value        numeric,
  duration_min integer,
  notes        text,
  notion_url   text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  synced_at    timestamptz
);

DROP TRIGGER IF EXISTS set_health_updated_at ON health;
CREATE TRIGGER set_health_updated_at
  BEFORE UPDATE ON health
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_health_date ON health(date);

ALTER TABLE health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_health" ON health;
CREATE POLICY "anon_select_health" ON health
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_health" ON health;
CREATE POLICY "service_role_all_health" ON health
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 7. contacts
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id           text PRIMARY KEY,
  name         text,
  role         text,
  company      text,
  email        text,
  phone        text,
  tags         text[],
  last_contact timestamptz,
  notion_url   text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  synced_at    timestamptz
);

DROP TRIGGER IF EXISTS set_contacts_updated_at ON contacts;
CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contacts" ON contacts;
CREATE POLICY "anon_select_contacts" ON contacts
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_contacts" ON contacts;
CREATE POLICY "service_role_all_contacts" ON contacts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 8. content
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content (
  id             text PRIMARY KEY,
  title          text,
  type           text,
  status         text,
  platform       text,
  scheduled_date timestamptz,
  published_url  text,
  notion_url     text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  synced_at      timestamptz
);

DROP TRIGGER IF EXISTS set_content_updated_at ON content;
CREATE TRIGGER set_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);

ALTER TABLE content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_content" ON content;
CREATE POLICY "anon_select_content" ON content
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_content" ON content;
CREATE POLICY "service_role_all_content" ON content
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 9. creators
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creators (
  id         text PRIMARY KEY,
  name       text,
  platform   text,
  handle     text,
  style      text,
  topics     text[],
  relevance  text,
  notion_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at  timestamptz
);

DROP TRIGGER IF EXISTS set_creators_updated_at ON creators;
CREATE TRIGGER set_creators_updated_at
  BEFORE UPDATE ON creators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_creators" ON creators;
CREATE POLICY "anon_select_creators" ON creators
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_creators" ON creators;
CREATE POLICY "service_role_all_creators" ON creators
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 10. decisions
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decisions (
  id         text PRIMARY KEY,
  title      text,
  date       timestamptz,
  context    text,
  options    text,
  chosen     text,
  outcome    text,
  notion_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at  timestamptz
);

DROP TRIGGER IF EXISTS set_decisions_updated_at ON decisions;
CREATE TRIGGER set_decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_decisions_date ON decisions(date);

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_decisions" ON decisions;
CREATE POLICY "anon_select_decisions" ON decisions
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_decisions" ON decisions;
CREATE POLICY "service_role_all_decisions" ON decisions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 11. skills
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id         text PRIMARY KEY,
  name       text,
  category   text,
  level      text,
  progress   integer,
  notion_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at  timestamptz
);

DROP TRIGGER IF EXISTS set_skills_updated_at ON skills;
CREATE TRIGGER set_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_skills" ON skills;
CREATE POLICY "anon_select_skills" ON skills
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_skills" ON skills;
CREATE POLICY "service_role_all_skills" ON skills
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 12. brain_dumps
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brain_dumps (
  id         text PRIMARY KEY,
  title      text,
  content    text,
  tags       text[],
  notion_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at  timestamptz
);

DROP TRIGGER IF EXISTS set_brain_dumps_updated_at ON brain_dumps;
CREATE TRIGGER set_brain_dumps_updated_at
  BEFORE UPDATE ON brain_dumps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE brain_dumps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_brain_dumps" ON brain_dumps;
CREATE POLICY "anon_select_brain_dumps" ON brain_dumps
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_brain_dumps" ON brain_dumps;
CREATE POLICY "service_role_all_brain_dumps" ON brain_dumps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 13. agent_events (NEW)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id   text,
  event_type text,
  payload    jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_events_agent_id   ON agent_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_event_type ON agent_events(event_type);

ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_agent_events" ON agent_events;
CREATE POLICY "anon_select_agent_events" ON agent_events
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_agent_events" ON agent_events;
CREATE POLICY "service_role_all_agent_events" ON agent_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 14. notifications (NEW)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text,
  body       text,
  type       text,
  read       boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_all_notifications" ON notifications;
CREATE POLICY "service_role_all_notifications" ON notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- Realtime: enable for tasks, agent_events, notifications, finance, health
-- ──────────────────────────────────────────────────────────
-- Note: supabase_realtime publication may already exist; this is idempotent
DO $$
BEGIN
  -- tasks
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  END IF;

  -- agent_events
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'agent_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE agent_events;
  END IF;

  -- notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;

  -- finance
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'finance'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE finance;
  END IF;

  -- health
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'health'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE health;
  END IF;
END $$;
