-- Sales Calling System Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: sales_reps
CREATE TABLE IF NOT EXISTS sales_reps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('rep', 'manager', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    credit_type TEXT NOT NULL CHECK (credit_type IN ('Credit Card', 'Personal Loan', 'Car Loan', 'Home Loan')),
    bank_partner TEXT NOT NULL,
    requested_amount NUMERIC(12, 2),
    term_months INTEGER,
    interest_rate_range TEXT,
    application_status TEXT NOT NULL DEFAULT 'New' CHECK (
        application_status IN (
            'New', 
            'Contacted', 
            'Pre-qualified', 
            'Docs Collected', 
            'Submitted', 
            'Approved', 
            'Rejected',
            'Closed'
        )
    ),
    assigned_to UUID REFERENCES sales_reps(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: calls
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    rep_id UUID NOT NULL REFERENCES sales_reps(id) ON DELETE CASCADE,
    call_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration INTEGER, -- Duration in seconds
    outcome TEXT NOT NULL CHECK (
        outcome IN (
            'Interested', 
            'Docs Pending', 
            'Follow-Up', 
            'Rejected', 
            'Closed Won',
            'No Answer',
            'Not Interested'
        )
    ),
    notes TEXT,
    next_followup_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: status_history
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES sales_reps(id) ON DELETE CASCADE,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(application_status);
CREATE INDEX IF NOT EXISTS idx_leads_credit_type ON leads(credit_type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_rep_id ON calls(rep_id);
CREATE INDEX IF NOT EXISTS idx_calls_call_time ON calls(call_time);
CREATE INDEX IF NOT EXISTS idx_status_history_lead_id ON status_history(lead_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to track status changes
CREATE OR REPLACE FUNCTION track_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.application_status IS DISTINCT FROM NEW.application_status THEN
        INSERT INTO status_history (lead_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.application_status, NEW.application_status, NEW.assigned_to);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track status changes
DROP TRIGGER IF EXISTS track_lead_status_changes ON leads;
CREATE TRIGGER track_lead_status_changes
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION track_status_change();

-- Insert sample sales reps
INSERT INTO sales_reps (name, email, phone, role) VALUES
    ('Admin User', 'admin@appro.ae', '+971501234567', 'admin'),
    ('Sarah Manager', 'sarah.manager@appro.ae', '+971502345678', 'manager'),
    ('John Rep', 'john.rep@appro.ae', '+971503456789', 'rep'),
    ('Jane Rep', 'jane.rep@appro.ae', '+971504567890', 'rep')
ON CONFLICT (email) DO NOTHING;

-- Insert sample leads
INSERT INTO leads (name, phone, email, credit_type, bank_partner, requested_amount, term_months, interest_rate_range, application_status, assigned_to, notes)
SELECT 
    'Ali Khan',
    '+971501234567',
    'ali.khan@example.com',
    'Personal Loan',
    'Emirates NBD',
    50000,
    24,
    '7-9%',
    'Pre-qualified',
    (SELECT id FROM sales_reps WHERE email = 'john.rep@appro.ae' LIMIT 1),
    'Requires salary verification documents'
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE email = 'ali.khan@example.com');

INSERT INTO leads (name, phone, email, credit_type, bank_partner, requested_amount, term_months, interest_rate_range, application_status, assigned_to, notes)
SELECT 
    'Fatima Ahmed',
    '+971509876543',
    'fatima.ahmed@example.com',
    'Credit Card',
    'Dubai Islamic Bank',
    NULL,
    NULL,
    NULL,
    'Contacted',
    (SELECT id FROM sales_reps WHERE email = 'jane.rep@appro.ae' LIMIT 1),
    'Interested in Platinum Credit Card'
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE email = 'fatima.ahmed@example.com');

INSERT INTO leads (name, phone, email, credit_type, bank_partner, requested_amount, term_months, interest_rate_range, application_status, assigned_to, notes)
SELECT 
    'Mohammed Hassan',
    '+971508765432',
    'mohammed.hassan@example.com',
    'Car Loan',
    'Abu Dhabi Commercial Bank',
    120000,
    60,
    '5-7%',
    'Docs Collected',
    (SELECT id FROM sales_reps WHERE email = 'john.rep@appro.ae' LIMIT 1),
    'All documents submitted, awaiting bank approval'
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE email = 'mohammed.hassan@example.com');

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Sales Reps policies
CREATE POLICY "Sales reps can view all reps" ON sales_reps
    FOR SELECT USING (true);

-- Leads policies
CREATE POLICY "Reps can view their assigned leads" ON leads
    FOR SELECT USING (
        assigned_to = auth.uid() OR 
        EXISTS (SELECT 1 FROM sales_reps WHERE id = auth.uid() AND role IN ('manager', 'admin'))
    );

CREATE POLICY "Reps can update their assigned leads" ON leads
    FOR UPDATE USING (
        assigned_to = auth.uid() OR 
        EXISTS (SELECT 1 FROM sales_reps WHERE id = auth.uid() AND role IN ('manager', 'admin'))
    );

CREATE POLICY "Managers and admins can insert leads" ON leads
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM sales_reps WHERE id = auth.uid() AND role IN ('manager', 'admin'))
    );

CREATE POLICY "Admins can delete leads" ON leads
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM sales_reps WHERE id = auth.uid() AND role = 'admin')
    );

-- Calls policies
CREATE POLICY "Users can view calls for their leads" ON calls
    FOR SELECT USING (
        rep_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM leads WHERE id = calls.lead_id AND assigned_to = auth.uid()) OR
        EXISTS (SELECT 1 FROM sales_reps WHERE id = auth.uid() AND role IN ('manager', 'admin'))
    );

CREATE POLICY "Users can insert calls" ON calls
    FOR INSERT WITH CHECK (true);

-- Status history policies
CREATE POLICY "Users can view status history for accessible leads" ON status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE id = status_history.lead_id 
            AND (assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM sales_reps WHERE id = auth.uid() AND role IN ('manager', 'admin')))
        )
    );
