-- CTAX Partner Portal V3 -- Database Schema
-- Supabase PostgreSQL with RLS

-- Partners
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),
  phone VARCHAR(20),
  tier VARCHAR(50) DEFAULT 'starter',
  status VARCHAR(50) DEFAULT 'active',
  bio TEXT,
  avatar_url TEXT,
  icp_ids UUID[],
  profile_complete BOOLEAN DEFAULT FALSE,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_tier ON partners(tier);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY partners_select ON partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY partners_update ON partners
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY partners_admin_select ON partners
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM partners WHERE user_id = auth.uid() AND tier = 'admin')
  );

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(20),
  client_city VARCHAR(100),
  client_state VARCHAR(2),
  tax_debt_estimate DECIMAL(12, 2),
  issue_type VARCHAR(100),
  years_affected INT,
  irs_notices BOOLEAN DEFAULT FALSE,
  stage VARCHAR(50) DEFAULT 'SUBMITTED',
  resolved_amount DECIMAL(12, 2),
  case_notes TEXT,
  commission_rate DECIMAL(5, 2),
  commission_amount DECIMAL(12, 2),
  commission_paid BOOLEAN DEFAULT FALSE,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_referrals_partner_id ON referrals(partner_id);
CREATE INDEX idx_referrals_stage ON referrals(stage);
CREATE INDEX idx_referrals_created_at ON referrals(created_at DESC);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY referrals_select ON referrals
  FOR SELECT USING (
    partner_id = (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY referrals_insert ON referrals
  FOR INSERT WITH CHECK (
    partner_id = (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY referrals_update ON referrals
  FOR UPDATE USING (
    partner_id = (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY referrals_admin_all ON referrals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM partners WHERE user_id = auth.uid() AND tier = 'admin')
  );

-- ICPs
CREATE TABLE icps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  annual_income_min DECIMAL(12, 2),
  annual_income_max DECIMAL(12, 2),
  industries TEXT[],
  disqualifiers TEXT[],
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_icps_partner_id ON icps(partner_id);

ALTER TABLE icps ENABLE ROW LEVEL SECURITY;

CREATE POLICY icps_select ON icps
  FOR SELECT USING (
    partner_id = (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY icps_insert ON icps
  FOR INSERT WITH CHECK (
    partner_id = (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY icps_update ON icps
  FOR UPDATE USING (
    partner_id = (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY icps_delete ON icps
  FOR DELETE USING (
    partner_id = (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Earnings
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_earnings_partner_id ON earnings(partner_id);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY earnings_select ON earnings
  FOR SELECT USING (
    partner_id = (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Payouts
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_ref VARCHAR(255),
  period_start DATE,
  period_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_payouts_partner_id ON payouts(partner_id);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY payouts_select ON payouts
  FOR SELECT USING (
    partner_id = (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Admin Logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100),
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_logs_select ON admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM partners WHERE user_id = auth.uid() AND tier = 'admin')
  );

CREATE POLICY admin_logs_insert ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM partners WHERE user_id = auth.uid() AND tier = 'admin')
  );
