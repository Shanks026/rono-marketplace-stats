-- Migration: make instances and instance_portals visible to all authenticated users
-- Replaces per-user RLS policies with team-wide access (any signed-in user can read/write)

-- ── instances ────────────────────────────────────────────────

DROP POLICY IF EXISTS "instances: select own" ON instances;
DROP POLICY IF EXISTS "instances: insert own" ON instances;
DROP POLICY IF EXISTS "instances: update own" ON instances;
DROP POLICY IF EXISTS "instances: delete own" ON instances;

CREATE POLICY "instances: select authenticated" ON instances
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "instances: insert authenticated" ON instances
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "instances: update authenticated" ON instances
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "instances: delete authenticated" ON instances
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ── instance_portals ─────────────────────────────────────────

DROP POLICY IF EXISTS "instance_portals: select own" ON instance_portals;
DROP POLICY IF EXISTS "instance_portals: insert own" ON instance_portals;
DROP POLICY IF EXISTS "instance_portals: update own" ON instance_portals;
DROP POLICY IF EXISTS "instance_portals: delete own" ON instance_portals;

CREATE POLICY "instance_portals: select authenticated" ON instance_portals
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "instance_portals: insert authenticated" ON instance_portals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "instance_portals: update authenticated" ON instance_portals
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "instance_portals: delete authenticated" ON instance_portals
  FOR DELETE USING (auth.uid() IS NOT NULL);
