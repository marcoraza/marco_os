# Supabase Migration — Marco OS

## Status

✅ SQL file written: `001_initial_schema.sql`  
❌ Could not execute remotely (missing DB credentials)

## What Was Tried

1. **`exec_sql` RPC endpoint** → doesn't exist (empty project)
2. **Management API** (`api.supabase.com`) → needs PAT (`sbp_xxxx` format), not service role key
3. **psql direct connection** → needs the project's database password
4. **Supabase CLI** (`supabase db push`) → needs PAT or DB password
5. **pg_net / edge functions** → project is empty, can't bootstrap

## To Execute the Migration

Pick one of these options:

### Option A — Supabase Dashboard (easiest)
1. Go to: https://app.supabase.com/project/rznqgjrlbirdzwpskdxy/sql
2. Paste contents of `001_initial_schema.sql`
3. Click **Run**

### Option B — psql (if you have the DB password)
```bash
PGPASSWORD="your-db-password" psql \
  "postgresql://postgres.rznqgjrlbirdzwpskdxy:your-db-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  -f 001_initial_schema.sql
```

### Option C — Supabase CLI (if you have a PAT)
```bash
# Get your PAT from: https://app.supabase.com/account/tokens
export SUPABASE_ACCESS_TOKEN=sbp_xxxx...

supabase link --project-ref rznqgjrlbirdzwpskdxy
supabase db push --workdir /path/to/marco_os/supabase
```

### Option D — Tell the agent your DB password
Reply with the database password and the agent will run the migration automatically via psql.

## What the Migration Creates

- 14 tables: `tasks`, `projects`, `meetings`, `research`, `finance`, `health`, `contacts`, `content`, `creators`, `decisions`, `skills`, `brain_dumps`, `agent_events`, `notifications`
- `updated_at` auto-triggers on all applicable tables
- Indexes on `status`, `date`, `agent_id` columns
- RLS enabled on all tables (anon=SELECT, service_role=ALL)
- Realtime enabled for: `tasks`, `agent_events`, `notifications`, `finance`, `health`
