-- ============================================================
-- RLS FIX — Run this in Supabase SQL Editor
-- Removes public write access from all tables.
-- All writes now go through the server-side /api/admin endpoint
-- which uses the service_role key and validates admin tokens.
-- ============================================================

-- ── settings ──────────────────────────────────────────────────
drop policy if exists "Public write"  on settings;
drop policy if exists "Public update" on settings;
drop policy if exists "Public delete" on settings;
-- Keep: "Public read" on settings (SELECT stays public)

-- ── broadcasters ──────────────────────────────────────────────
drop policy if exists "Public write"  on broadcasters;
drop policy if exists "Public update" on broadcasters;
drop policy if exists "Public delete" on broadcasters;
-- Keep: "Public read" on broadcasters (SELECT stays public)

-- ── rules ─────────────────────────────────────────────────────
drop policy if exists "Public write"  on rules;
drop policy if exists "Public update" on rules;
drop policy if exists "Public delete" on rules;
-- Keep: "Public read" on rules (SELECT stays public)

-- ── registrations ─────────────────────────────────────────────
-- Players can still sign up via the public form (INSERT stays).
-- Only admins can delete registrations (via /api/admin).
drop policy if exists "Public delete" on registrations;
-- Keep: "Public read" and "Public insert" on registrations

-- ── admin_users ───────────────────────────────────────────────
-- Enable RLS if not already enabled. No policies = no public access.
-- service_role bypasses RLS automatically.
alter table if exists admin_users enable row level security;

-- ── admin_logs ────────────────────────────────────────────────
alter table if exists admin_logs enable row level security;

-- ── visits ────────────────────────────────────────────────────
alter table if exists visits enable row level security;
