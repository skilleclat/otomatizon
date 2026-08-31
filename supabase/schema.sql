-- ============================================================
-- OTOMATIZON — PRODUCTION SUPABASE SQL MIGRATION SCHEMA
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan_id TEXT NOT NULL DEFAULT 'starter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Users Table (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Business Profiles Table
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    city TEXT DEFAULT 'Nairobi',
    country TEXT DEFAULT 'Kenya',
    currency TEXT DEFAULT 'KES',
    channels TEXT[] DEFAULT ARRAY['WhatsApp']::TEXT[],
    tools_used TEXT[] DEFAULT ARRAY['WhatsApp Business', 'Google Calendar']::TEXT[],
    biggest_repetitive_task TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Connected Apps & Integrations (Encrypted Credentials)
CREATE TABLE IF NOT EXISTS public.connected_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL, -- 'whatsapp_business', 'google_sheets', 'google_calendar', 'gmail', 'mpesa'
    status TEXT NOT NULL DEFAULT 'connected', -- 'connected', 'available', 'needs_attention', 'error'
    account_identifier TEXT, -- '+254 712...', 'kamau@gmail.com', 'Till 174379'
    encrypted_credentials TEXT, -- AES-256 GCM encrypted token/keys
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, app_id)
);

-- 6. Customer Leads (CRM Table Synced with Google Sheets)
CREATE TABLE IF NOT EXISTS public.customer_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT NOT NULL DEFAULT 'whatsapp',
    service_requested TEXT,
    status TEXT NOT NULL DEFAULT 'new_lead', -- 'new_lead', 'contacted', 'scheduled', 'paid', 'lost'
    sheet_row_number INTEGER,
    provenance TEXT NOT NULL DEFAULT 'OBSERVED',
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Workflows & Automations
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    slug TEXT NOT NULL, -- 'wf_lead_autopilot', 'wf_payment_recovery'
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    routing_pipeline TEXT[] DEFAULT ARRAY['whatsapp_business', 'google_sheets', 'google_calendar']::TEXT[],
    config JSONB DEFAULT '{"delayHours": 24}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Automation Runs & Execution Logs
CREATE TABLE IF NOT EXISTS public.automation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    trigger_event TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed', -- 'running', 'completed', 'failed', 'paused'
    actions_executed JSONB NOT NULL DEFAULT '[]'::JSONB,
    idempotency_key TEXT UNIQUE,
    execution_duration_ms INTEGER DEFAULT 180,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Activity Logs & Telemetry Stream
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    detail TEXT,
    provenance TEXT NOT NULL DEFAULT 'OBSERVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 11. Base RLS Policies (Tenant Isolation)
CREATE POLICY "Users can access own organization data"
    ON public.organizations
    FOR ALL
    USING (id IN (SELECT organization_id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own profile"
    ON public.users
    FOR ALL
    USING (auth_id = auth.uid());

CREATE POLICY "Tenant isolation for leads"
    ON public.customer_leads
    FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.users WHERE auth_id = auth.uid()));
