-- ============================================================================
-- CarrierCraft: Complete Clean Database DDL Schema (PostgreSQL 15+)
-- 15 Normalized Tables, Clean Enums, Performance Indexes, Zero Dead Weight
-- ============================================================================

-- 1. Admin Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'admin', -- 'superadmin', 'manager', 'viewer'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Countries
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,  -- e.g. 'AE', 'KE', 'SS'
    dial_code VARCHAR(10) NOT NULL,    -- e.g. '+971', '+254'
    currency VARCHAR(10) NOT NULL,     -- e.g. 'AED', 'KES'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Telecom Operators
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    country_id INT REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,         -- e.g. 'Etisalat', 'Zain', 'Safaricom'
    code VARCHAR(50) NOT NULL,          -- e.g. 'ETISALAT', 'ZAIN'
    detection_headers JSONB DEFAULT '["x-msisdn", "x-network-info", "x-up-calling-line-id"]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_id, code)
);

-- 4. Campaigns (Offers & Funnels)
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    tracking_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'AE-ETISALAT-101'
    operator_id INT REFERENCES operators(id) ON DELETE RESTRICT,
    country_code VARCHAR(10) NOT NULL,
    operator_code VARCHAR(50) NOT NULL,
    verification_mode VARCHAR(30) NOT NULL DEFAULT 'BOTH', -- 'BOTH', 'OTP_ONLY', 'HEADER_INJECTION', 'NONE'
    service_id VARCHAR(100),
    price_text VARCHAR(50) DEFAULT '3.5 AED/day',
    daily_cap INT DEFAULT 0,                 -- 0 = Unlimited
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. GrapesJS Templates (HTML, CSS, Canvas JSON)
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    html_content TEXT NOT NULL,
    css_content TEXT DEFAULT '',
    project_data JSONB DEFAULT '{}',         -- GrapesJS internal state
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Campaign Pages (Mapping of Campaign -> Page Type -> Template)
CREATE TABLE IF NOT EXISTS campaign_pages (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    page_type VARCHAR(30) NOT NULL,         -- 'HOME', 'OTP', 'CONFIRM', 'THANKYOU', 'BLOCKED', 'ERROR', 'LOW_BALANCE'
    template_id INT REFERENCES templates(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, page_type)
);

-- 7. Partner Telecom Billing API Configs
CREATE TABLE IF NOT EXISTS api_configs (
    id SERIAL PRIMARY KEY,
    campaign_id INT UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
    check_sub_url TEXT,                     -- Check subscription status API
    send_otp_url TEXT,                      -- Send SMS OTP API
    verify_otp_url TEXT,                    -- Verify OTP API
    subscribe_url TEXT,                     -- Direct charge API (1-Click HE)
    blocklist_url TEXT,                     -- DND / Blacklist check API
    resolve_msisdn_url TEXT,                -- Remote HE resolver API
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Traffic Vendors (Ad Networks)
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,             -- e.g. 'PropellerAds', 'Mobidea'
    code VARCHAR(50) UNIQUE NOT NULL,       -- e.g. 'ADM01', 'PROPELLER'
    postback_url TEXT,                      -- e.g. 'https://network.com/postback?clickid={click_id}&payout={payout}'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Affiliates (Sub-publishers under vendors)
CREATE TABLE IF NOT EXISTS affiliates (
    id SERIAL PRIMARY KEY,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    affiliate_code VARCHAR(50) NOT NULL,    -- e.g. 'AFF_BE'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, affiliate_code)
);

-- 10. Campaign Trackings (Vendor Assignment, Payouts, Daily Caps)
CREATE TABLE IF NOT EXISTS campaign_trackings (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    affiliate_id INT REFERENCES affiliates(id) ON DELETE SET NULL,
    payout_usd NUMERIC(10, 4) DEFAULT 1.5000,
    daily_cap INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, vendor_id, affiliate_id)
);

-- 11. Visits (Core High-Traffic Ingestion)
CREATE TABLE IF NOT EXISTS visits (
    id VARCHAR(64) PRIMARY KEY,             -- e.g. 'vst_1723456789_abc123'
    campaign_id INT REFERENCES campaigns(id) ON DELETE RESTRICT,
    vendor_id INT REFERENCES vendors(id) ON DELETE SET NULL,
    affiliate_id INT REFERENCES affiliates(id) ON DELETE SET NULL,
    tracking_campid VARCHAR(50) NOT NULL,
    click_id VARCHAR(255),                  -- Ad network click ID
    msisdn VARCHAR(30),                     -- Resolved phone number
    user_ip VARCHAR(50),
    user_agent TEXT,
    he_resolved BOOLEAN DEFAULT FALSE,      -- Phone auto-detected via HE
    otp_verified_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'VISIT', -- 'VISIT', 'HOME_SHOWN', 'OTP_SHOWN', 'SUBSCRIBED', 'BLOCKED', 'FAILED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Visit Events (Session Timeline Waterfall)
CREATE TABLE IF NOT EXISTS visit_events (
    id BIGSERIAL PRIMARY KEY,
    visit_id VARCHAR(64) REFERENCES visits(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,        -- 'DETECT_SUCCESS', 'PAGE_VIEW', 'OTP_SENT', 'OTP_VERIFIED', 'SUBSCRIBE_SUCCESS'
    page_type VARCHAR(30),                  -- 'HOME', 'OTP', 'CONFIRM', 'THANKYOU'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Conversion Postbacks (S2S Postback Audit & Retry)
CREATE TABLE IF NOT EXISTS conversion_postbacks (
    id SERIAL PRIMARY KEY,
    visit_id VARCHAR(64) REFERENCES visits(id) ON DELETE CASCADE,
    vendor_id INT REFERENCES vendors(id) ON DELETE SET NULL,
    click_id VARCHAR(255) NOT NULL,
    request_url TEXT NOT NULL,
    http_status INT,
    response_body TEXT,
    is_success BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Outbound Telecom API Call Logs
CREATE TABLE IF NOT EXISTS api_call_logs (
    id BIGSERIAL PRIMARY KEY,
    visit_id VARCHAR(64),
    call_type VARCHAR(50) NOT NULL,         -- 'CHECKSUB', 'SEND_OTP', 'VERIFY_OTP', 'SUBSCRIBE'
    endpoint_url TEXT NOT NULL,
    http_status INT,
    latency_ms INT,
    request_payload JSONB DEFAULT '{}',
    response_payload JSONB DEFAULT '{}',
    is_success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Daily Pre-Aggregated Stats (High-Speed Dashboard Queries)
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    total_visits INT DEFAULT 0,
    he_hits INT DEFAULT 0,
    otp_sent INT DEFAULT 0,
    otp_verified INT DEFAULT 0,
    total_conversions INT DEFAULT 0,
    revenue_usd NUMERIC(12, 4) DEFAULT 0.0000,
    UNIQUE(stat_date, campaign_id, vendor_id)
);

-- Performance Indexes (High-Throughput Optimization)
CREATE INDEX IF NOT EXISTS idx_visits_camp_created ON visits(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_click_id ON visits(click_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visit_events_visit_id ON visit_events(visit_id);
CREATE INDEX IF NOT EXISTS idx_postbacks_click_id ON conversion_postbacks(click_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(stat_date DESC);
