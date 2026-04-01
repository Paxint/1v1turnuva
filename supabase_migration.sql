-- ============================================================
-- 1. SETTINGS  (badge metni, follow URL, poster URL per broadcaster)
-- ============================================================
create table if not exists settings (
  id           bigint generated always as identity primary key,
  broadcaster  text        not null,   -- 'pax' | 'raku' | 'redjangu'
  key          text        not null,   -- 'badge' | 'follow_url' | 'poster_url'
  value        text        not null,
  updated_at   timestamptz not null default now(),
  unique(broadcaster, key)
);

-- Row Level Security
alter table settings enable row level security;
create policy "Public read"   on settings for select using (true);
create policy "Public write"  on settings for insert with check (true);
create policy "Public update" on settings for update using (true);
create policy "Public delete" on settings for delete using (true);


-- ============================================================
-- 2. BROADCASTERS  (yayıncı kartları: isim, unvan, görsel)
-- ============================================================
create table if not exists broadcasters (
  id              bigint generated always as identity primary key,
  broadcaster_key text   not null,   -- 'pax' | 'raku' | 'redjangu'
  sort_order      int    not null default 0,
  name            text   not null,
  subtitle        text   not null default 'Yayıncı',
  image_url       text   not null default '',
  updated_at      timestamptz not null default now(),
  unique(broadcaster_key, sort_order)
);

alter table broadcasters enable row level security;
create policy "Public read"   on broadcasters for select using (true);
create policy "Public write"  on broadcasters for insert with check (true);
create policy "Public update" on broadcasters for update using (true);
create policy "Public delete" on broadcasters for delete using (true);

-- Seed default rows
insert into broadcasters (broadcaster_key, sort_order, name, subtitle) values
  ('pax',      0, 'Paxint',    'Yayıncı'),
  ('pax',      1, 'Rakuexe27', 'Yayıncı'),
  ('pax',      2, 'Redjangu',  'Yayıncı'),
  ('raku',     0, 'Paxint',    'Yayıncı'),
  ('raku',     1, 'Rakuexe27', 'Yayıncı'),
  ('raku',     2, 'Redjangu',  'Yayıncı'),
  ('redjangu', 0, 'Paxint',    'Yayıncı'),
  ('redjangu', 1, 'Rakuexe27', 'Yayıncı'),
  ('redjangu', 2, 'Redjangu',  'Yayıncı')
on conflict do nothing;


-- ============================================================
-- 3. RULES  (turnuva kuralları per broadcaster)
-- ============================================================
create table if not exists rules (
  id          bigint generated always as identity primary key,
  broadcaster text   not null,
  sort_order  int    not null default 0,
  title       text   not null,
  items       jsonb  not null default '[]'
);

alter table rules enable row level security;
create policy "Public read"   on rules for select using (true);
create policy "Public write"  on rules for insert with check (true);
create policy "Public update" on rules for update using (true);
create policy "Public delete" on rules for delete using (true);


-- ============================================================
-- 4. REGISTRATIONS  (turnuva kayıtları)
-- ============================================================
create table if not exists registrations (
  id         bigint generated always as identity primary key,
  kick_nick  text        not null unique,
  lol_nick   text        not null unique,
  created_at timestamptz not null default now()
);

alter table registrations enable row level security;
create policy "Public read"   on registrations for select using (true);
create policy "Public insert" on registrations for insert with check (true);
create policy "Public delete" on registrations for delete using (true);
