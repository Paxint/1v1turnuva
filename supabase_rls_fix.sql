-- ============================================================
-- RLS Güvenlik Düzeltmesi
-- Supabase SQL Editor'da çalıştır
-- ============================================================

-- settings: public yazma yetkilerini kaldır, okuma kalsın
DROP POLICY IF EXISTS "Public write"  ON settings;
DROP POLICY IF EXISTS "Public update" ON settings;
DROP POLICY IF EXISTS "Public delete" ON settings;

-- broadcasters: public yazma yetkilerini kaldır, okuma kalsın
DROP POLICY IF EXISTS "Public write"  ON broadcasters;
DROP POLICY IF EXISTS "Public update" ON broadcasters;
DROP POLICY IF EXISTS "Public delete" ON broadcasters;

-- rules: public yazma yetkilerini kaldır, okuma kalsın
DROP POLICY IF EXISTS "Public write"  ON rules;
DROP POLICY IF EXISTS "Public update" ON rules;
DROP POLICY IF EXISTS "Public delete" ON rules;

-- registrations: silme yetkisini kaldır (public insert kalıyor — turnuva kaydı için)
DROP POLICY IF EXISTS "Public delete" ON registrations;

-- admin_users: tamamen kapat (service_role bypass eder)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read"   ON admin_users;
DROP POLICY IF EXISTS "Public write"  ON admin_users;
DROP POLICY IF EXISTS "Public update" ON admin_users;
DROP POLICY IF EXISTS "Public delete" ON admin_users;

-- admin_logs: tamamen kapat
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read"   ON admin_logs;
DROP POLICY IF EXISTS "Public write"  ON admin_logs;
DROP POLICY IF EXISTS "Public insert" ON admin_logs;
DROP POLICY IF EXISTS "Public update" ON admin_logs;
DROP POLICY IF EXISTS "Public delete" ON admin_logs;

-- visits: tamamen kapat
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read"   ON visits;
DROP POLICY IF EXISTS "Public write"  ON visits;
DROP POLICY IF EXISTS "Public insert" ON visits;
DROP POLICY IF EXISTS "Public update" ON visits;
DROP POLICY IF EXISTS "Public delete" ON visits;
