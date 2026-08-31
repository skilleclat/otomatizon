-- OTOMATIZON: Production PostgreSQL & Supabase Database Architecture
-- Multi-Tenant Schema with Row Level Security (RLS)
-- Optimized for Small Businesses, Coaches & Tutors in Kenya

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE integration_status AS ENUM ('active', 'needs_reauth', 'disconnected', 'setup_required');
CREATE TYPE lead_status AS ENUM ('new', 'info_sent', 'booked', 'paid', 'lost');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('requested', 'completed', 'failed');
CREATE TYPE impact_level AS ENUM ('High impact', 'Medium impact', 'Low impact');
CREATE TYPE workflow_execution_status AS ENUM ('in_progress', 'completed', 'failed', 'waiting_delay');

-- 3. ORGANIZATIONS (TENANTS)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    timezone VARCHAR(64) NOT NULL DEFAULT 'Africa/Nairobi',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- 4. USERS & MEMBERSHIPS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);
CREATE INDEX idx_memberships_org ON memberships(organization_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);

-- 5. BUSINESS PROFILES
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    city VARCHAR(100) DEFAULT 'Nairobi',
    country VARCHAR(100) DEFAULT 'Kenya',
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    primary_channels JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_audience TEXT,
    average_deal_size_kes NUMERIC(12, 2) DEFAULT 3500.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INTEGRATIONS & CREDENTIALS
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    connected BOOLEAN NOT NULL DEFAULT FALSE,
    account_identifier VARCHAR(255),
    status integration_status NOT NULL DEFAULT 'disconnected',
    last_synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, integration_id)
);
CREATE INDEX idx_integrations_org ON integrations(organization_id);

-- Encrypted credential storage (never logged, isolated)
CREATE TABLE integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_ref_id UUID UNIQUE NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    encrypted_tokens BYTEA,
    token_iv BYTEA,
    auth_type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. LEADS & CUSTOMERS
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(50) NOT NULL DEFAULT 'whatsapp',
    status lead_status NOT NULL DEFAULT 'new',
    inquired_service VARCHAR(255),
    potential_value_kes NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    last_contact_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leads_org_status ON leads(organization_id, status);
CREATE INDEX idx_leads_phone ON leads(phone);

-- 8. APPOINTMENTS
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    service_title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    google_calendar_event_id VARCHAR(255),
    meet_link TEXT,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_appointments_org_date ON appointments(organization_id, scheduled_at);

-- 9. PAYMENTS (M-PESA / MOBILE MONEY)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    amount_kes NUMERIC(12, 2) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'mpesa',
    reference_code VARCHAR(100) UNIQUE NOT NULL,
    status payment_status NOT NULL DEFAULT 'requested',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    raw_payload JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX idx_payments_org_ref ON payments(organization_id, reference_code);

-- 10. OPPORTUNITY ENGINE
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    problem TEXT NOT NULL,
    evidence TEXT NOT NULL,
    impact_score NUMERIC(5, 2) NOT NULL,
    impact_level impact_level NOT NULL DEFAULT 'High impact',
    confidence_score INTEGER NOT NULL DEFAULT 90,
    estimated_hours_saved NUMERIC(5, 2) DEFAULT 0,
    estimated_revenue_at_risk_kes NUMERIC(12, 2) DEFAULT 0,
    recommendation TEXT NOT NULL,
    suggested_workflow_title VARCHAR(255) NOT NULL,
    suggested_workflow_description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'detected',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_opportunities_org_status ON opportunities(organization_id, status);

-- 11. WORKFLOWS & AUTOMATIONS (HUMAN APPROVED)
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'lead_management',
    active BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_description TEXT NOT NULL,
    definition JSONB NOT NULL, -- Structured DAG steps, actions, conditions
    runs_count INTEGER NOT NULL DEFAULT 0,
    leads_helped INTEGER NOT NULL DEFAULT 0,
    hours_saved NUMERIC(8, 2) NOT NULL DEFAULT 0,
    revenue_recovered_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_workflows_org_active ON workflows(organization_id, active);

CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    workflow_title VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(255) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    status workflow_execution_status NOT NULL DEFAULT 'in_progress',
    current_step_index INTEGER NOT NULL DEFAULT 0,
    steps_total INTEGER NOT NULL DEFAULT 1,
    log_summary TEXT,
    execution_trace JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_workflow_executions_org ON workflow_executions(organization_id, status);

-- 12. ACTIVITY & AUDIT LOGS
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'system',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activity_logs_org_ts ON activity_logs(organization_id, timestamp DESC);

-- 13. SUBSCRIPTIONS & USAGE (KES BILLING)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL DEFAULT 'starter',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Helper: ensures users only access rows where they have an active membership
CREATE POLICY org_tenant_isolation ON business_profiles
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY leads_tenant_isolation ON leads
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY workflows_tenant_isolation ON workflows
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY activity_tenant_isolation ON activity_logs
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY appointments_tenant_isolation ON appointments
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY payments_tenant_isolation ON payments
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY opportunities_tenant_isolation ON opportunities
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY executions_tenant_isolation ON workflow_executions
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY subscriptions_tenant_isolation ON subscriptions
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY credentials_tenant_isolation ON integration_credentials
    FOR ALL USING (
        organization_id IN (
            SELECT m.organization_id FROM memberships m
            WHERE m.user_id = auth.uid()
        )
    );

-- Idempotency Constraints (P0: Prevents duplicate payment prompts or duplicate executions)
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_idempotency_idx 
    ON payments (organization_id, idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_executions_idempotency_idx 
    ON workflow_executions (organization_id, idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

