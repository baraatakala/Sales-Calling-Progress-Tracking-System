-- ============================================
-- NEW SCHEMA WITHOUT AUTHENTICATION
-- Credit Sales Calling Progress Tracking System
-- ============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- Table: sales_reps
-- ============================================
CREATE TABLE sales_reps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('admin', 'sales_rep', 'manager')) DEFAULT 'sales_rep',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_reps_email ON sales_reps(email);
CREATE INDEX idx_sales_reps_role ON sales_reps(role);

CREATE TRIGGER update_sales_reps_updated_at
    BEFORE UPDATE ON sales_reps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: leads
-- ============================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    status TEXT CHECK (status IN ('New', 'In Progress', 'Converted', 'Lost')) DEFAULT 'New',
    assigned_to UUID REFERENCES sales_reps(id) ON DELETE SET NULL,
    credit_limit NUMERIC(12, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_company_name ON leads(company_name);

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: calls
-- ============================================
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    sales_rep_id UUID REFERENCES sales_reps(id) ON DELETE SET NULL,
    call_date TIMESTAMPTZ DEFAULT NOW(),
    duration_minutes INTEGER,
    outcome TEXT CHECK (outcome IN ('No Answer', 'Callback Requested', 'Interested', 'Not Interested', 'Converted')) NOT NULL,
    notes TEXT,
    next_followup_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_sales_rep_id ON calls(sales_rep_id);
CREATE INDEX idx_calls_call_date ON calls(call_date);
CREATE INDEX idx_calls_outcome ON calls(outcome);

-- ============================================
-- Table: status_history
-- ============================================
CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES sales_reps(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX idx_status_history_lead_id ON status_history(lead_id);
CREATE INDEX idx_status_history_changed_at ON status_history(changed_at);

-- ============================================
-- Trigger: Auto-log status changes
-- ============================================
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO status_history (lead_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_lead_status_changes
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION log_status_change();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample sales reps
INSERT INTO sales_reps (name, email, phone, role) VALUES
('Ahmed Al-Mansoori', 'ahmed@appro.ae', '+971501234567', 'admin'),
('Sarah Johnson', 'sarah@appro.ae', '+971507654321', 'sales_rep'),
('Mohammed Hassan', 'mohammed@appro.ae', '+971509876543', 'sales_rep'),
('Fatima Al-Zaabi', 'fatima@appro.ae', '+971502345678', 'manager');

-- Insert sample leads
INSERT INTO leads (company_name, contact_person, phone, email, address, city, status, assigned_to, credit_limit, notes)
SELECT 
    v.company_name, 
    v.contact_person, 
    v.phone, 
    v.email, 
    v.address, 
    v.city, 
    v.status, 
    sr.id as assigned_to, 
    v.credit_limit, 
    v.notes
FROM (
    VALUES 
        ('ABC Trading LLC', 'John Smith', '+971501111111', 'john@abctrading.ae', 'Building 123, Sheikh Zayed Road', 'Dubai', 'New', 'ahmed@appro.ae', 50000.00, 'Referred by existing client'),
        ('XYZ Electronics', 'Mary Jones', '+971502222222', 'mary@xyzelec.ae', 'Industrial Area 1', 'Sharjah', 'In Progress', 'sarah@appro.ae', 75000.00, 'Interested in bulk orders'),
        ('Tech Solutions FZ', 'Ali Rahman', '+971503333333', 'ali@techsol.ae', 'Dubai Internet City', 'Dubai', 'In Progress', 'mohammed@appro.ae', 100000.00, 'Requires custom payment terms'),
        ('Golden Star Trading', 'Emma Wilson', '+971504444444', 'emma@goldenstar.ae', 'Deira Market', 'Dubai', 'Converted', 'sarah@appro.ae', 60000.00, 'Completed first order successfully'),
        ('Future Dynamics', 'Hassan Ahmed', '+971505555555', 'hassan@futuredyn.ae', 'Business Bay', 'Dubai', 'Lost', 'mohammed@appro.ae', 45000.00, 'Chose competitor'),
        ('Prime Retailers', 'Sophie Brown', '+971506666666', 'sophie@primeretail.ae', 'Al Barsha', 'Dubai', 'New', 'ahmed@appro.ae', 55000.00, 'Cold call - interested'),
        ('Elite Enterprises', 'Omar Khalid', '+971507777777', 'omar@elite.ae', 'JAFZA', 'Dubai', 'In Progress', 'fatima@appro.ae', 120000.00, 'Large potential client'),
        ('Smart Systems LLC', 'Lisa Anderson', '+971508888888', 'lisa@smartsys.ae', 'Media City', 'Dubai', 'New', 'sarah@appro.ae', 40000.00, 'Follow up next week')
) AS v(company_name, contact_person, phone, email, address, city, status, assigned_email, credit_limit, notes)
JOIN sales_reps sr ON sr.email = v.assigned_email;

-- Insert sample calls
INSERT INTO calls (lead_id, sales_rep_id, call_date, duration_minutes, outcome, notes, next_followup_date)
SELECT 
    l.id,
    l.assigned_to,
    NOW() - (random() * interval '30 days'),
    (random() * 30 + 5)::INTEGER,
    (ARRAY['No Answer', 'Callback Requested', 'Interested', 'Not Interested', 'Converted'])[floor(random() * 5 + 1)],
    'Sample call note #' || generate_series,
    CASE 
        WHEN random() > 0.5 THEN (NOW() + (random() * interval '14 days'))::DATE
        ELSE NULL
    END
FROM leads l
CROSS JOIN generate_series(1, 3);

-- ============================================
-- Enable Row Level Security (Optional - disabled for now)
-- ============================================
-- ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT 'Schema created successfully!' as status;
SELECT COUNT(*) as sales_reps_count FROM sales_reps;
SELECT COUNT(*) as leads_count FROM leads;
SELECT COUNT(*) as calls_count FROM calls;
