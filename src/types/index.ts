// TypeScript Types for Credit Sales Calling System

export type UserRole = 'admin' | 'sales_rep' | 'manager';

export type LeadStatus = 'New' | 'In Progress' | 'Converted' | 'Lost';

export type CallOutcome = 
  | 'No Answer' 
  | 'Callback Requested' 
  | 'Interested' 
  | 'Not Interested' 
  | 'Converted';

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  status: LeadStatus;
  assigned_to?: string;
  credit_limit?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  sales_rep?: SalesRep;
}

export interface Call {
  id: string;
  lead_id: string;
  sales_rep_id: string;
  call_date: string;
  duration_minutes?: number;
  outcome: CallOutcome;
  notes?: string;
  next_followup_date?: string;
  created_at: string;
  // Joined data
  lead?: Lead;
  sales_rep?: SalesRep;
}

export interface StatusHistory {
  id: string;
  lead_id: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  changed_at: string;
  notes?: string;
  // Joined data
  sales_rep?: SalesRep;
}

export interface DashboardMetrics {
  totalLeads: number;
  totalCallsToday: number;
  pendingDocs: number;
  conversionRate: number;
  approvalsByBank: { bank: string; count: number }[];
  leadsByCreditType: { type: string; count: number }[];
  callsByRep: { rep: string; count: number }[];
  recentLeads: Lead[];
  upcomingFollowups: Call[];
}

export interface LeadFormData {
  company_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  status?: LeadStatus;
  assigned_to?: string;
  credit_limit?: number;
  notes?: string;
}

export interface CallFormData {
  lead_id: string;
  sales_rep_id: string;
  call_date: string;
  duration_minutes?: number;
  outcome: CallOutcome;
  notes?: string;
  next_followup_date?: string;
}

export interface AuthUser extends SalesRep {
  // Extended authentication user
}

export interface FilterOptions {
  status?: LeadStatus;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Legacy types for compatibility (deprecated)
export type CreditType = string;
export type ApplicationStatus = string;
export type Priority = string;
