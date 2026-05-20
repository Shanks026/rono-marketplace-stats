-- Migration: create instances and instance_portals tables

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── instances ────────────────────────────────────────────────

CREATE TABLE instances (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX instances_user_id_idx ON instances(user_id);

CREATE TRIGGER instances_updated_at
  BEFORE UPDATE ON instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instances: select own" ON instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "instances: insert own" ON instances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "instances: update own" ON instances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "instances: delete own" ON instances FOR DELETE USING (auth.uid() = user_id);

-- ── instance_portals ─────────────────────────────────────────

CREATE TABLE instance_portals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  email       TEXT,
  username    TEXT NOT NULL DEFAULT '',
  password    TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX instance_portals_instance_id_idx ON instance_portals(instance_id);
CREATE INDEX instance_portals_user_id_idx     ON instance_portals(user_id);

CREATE TRIGGER instance_portals_updated_at
  BEFORE UPDATE ON instance_portals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE instance_portals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instance_portals: select own" ON instance_portals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "instance_portals: insert own" ON instance_portals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "instance_portals: update own" ON instance_portals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "instance_portals: delete own" ON instance_portals FOR DELETE USING (auth.uid() = user_id);
