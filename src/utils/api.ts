import { supabase } from './supabaseClient';
import type { 
  Lead, 
  Call, 
  SalesRep, 
  StatusHistory, 
  LeadFormData, 
  CallFormData,
  FilterOptions,
  DashboardMetrics
} from '../types';

// ===== SALES REPS API =====

export const fetchSalesReps = async (): Promise<SalesRep[]> => {
  const { data, error } = await supabase
    .from('sales_reps')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const fetchSalesRepById = async (id: string): Promise<SalesRep | null> => {
  const { data, error } = await supabase
    .from('sales_reps')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createSalesRep = async (salesRepData: Omit<SalesRep, 'id' | 'created_at' | 'updated_at'>): Promise<SalesRep> => {
  const { data, error } = await supabase
    .from('sales_reps')
    .insert([salesRepData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSalesRep = async (id: string, salesRepData: Partial<Omit<SalesRep, 'id' | 'created_at' | 'updated_at'>>): Promise<SalesRep> => {
  const { data, error } = await supabase
    .from('sales_reps')
    .update(salesRepData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSalesRep = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('sales_reps')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ===== LEADS API =====

export const fetchLeads = async (filters?: FilterOptions): Promise<Lead[]> => {
  let query = supabase
    .from('leads')
    .select(`
      *,
      sales_rep:sales_reps(*)
    `)
    .order('created_at', { ascending: false });

  // Apply filters - mapped to new schema fields
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }
  if (filters?.search) {
    query = query.or(`company_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const fetchLeadById = async (id: string): Promise<Lead | null> => {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      sales_rep:sales_reps(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createLead = async (leadData: LeadFormData): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert([leadData])
    .select(`
      *,
      sales_rep:sales_reps(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateLead = async (id: string, leadData: Partial<LeadFormData>): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .update(leadData)
    .eq('id', id)
    .select(`
      *,
      sales_rep:sales_reps(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteLead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ===== CALLS API =====

export const fetchCalls = async (leadId?: string): Promise<Call[]> => {
  let query = supabase
    .from('calls')
    .select(`
      *,
      lead:leads(*),
      sales_rep:sales_reps(*)
    `)
    .order('call_date', { ascending: false });

  if (leadId) {
    query = query.eq('lead_id', leadId);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const createCall = async (callData: CallFormData): Promise<Call> => {
  const { data, error } = await supabase
    .from('calls')
    .insert([callData])
    .select(`
      *,
      lead:leads(*),
      sales_rep:sales_reps(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

// ===== STATUS HISTORY API =====

export const fetchStatusHistory = async (leadId: string): Promise<StatusHistory[]> => {
  const { data, error } = await supabase
    .from('status_history')
    .select(`
      *,
      sales_rep:sales_reps(*)
    `)
    .eq('lead_id', leadId)
    .order('changed_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// ===== DASHBOARD API =====

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    // Fetch all leads
    const { data: allLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*');
    
    if (leadsError) throw leadsError;

    // Fetch calls from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayCalls, error: callsError } = await supabase
      .from('calls')
      .select('*')
      .gte('call_date', today.toISOString());
    
    if (callsError) throw callsError;

    // Calculate metrics
    const totalLeads = allLeads?.length || 0;
    const totalCallsToday = todayCalls?.length || 0;
    
    // Count leads by status
    const convertedLeads = allLeads?.filter(l => l.status === 'Converted').length || 0;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    
    // Leads in progress
    const inProgressLeads = allLeads?.filter(l => l.status === 'In Progress').length || 0;

    // Leads by status for chart
    const statusCounts: { [key: string]: number } = {};
    allLeads?.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    const leadsByStatus = Object.entries(statusCounts).map(([status, count]) => ({ 
      bank: status, // Using 'bank' field for compatibility with chart component
      count 
    }));

    // Leads by city for chart
    const cityCounts: { [key: string]: number } = {};
    allLeads?.forEach(lead => {
      const city = lead.city || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    const leadsByCity = Object.entries(cityCounts).map(([city, count]) => ({ 
      type: city, // Using 'type' field for compatibility with chart component
      count 
    }));

    // Calls by rep
    const { data: callsWithRep, error: callsRepError } = await supabase
      .from('calls')
      .select(`
        *,
        sales_rep:sales_reps(name)
      `);
    
    if (callsRepError) throw callsRepError;

    const repCounts: { [key: string]: number } = {};
    callsWithRep?.forEach(call => {
      const repName = (call.sales_rep as any)?.name || 'Unknown';
      repCounts[repName] = (repCounts[repName] || 0) + 1;
    });
    const callsByRep = Object.entries(repCounts).map(([rep, count]) => ({ rep, count }));

    // Recent leads
    const recentLeads = allLeads?.slice(0, 5) || [];

    // Upcoming follow-ups
    const { data: upcomingFollowups, error: followupsError } = await supabase
      .from('calls')
      .select(`
        *,
        lead:leads(*),
        sales_rep:sales_reps(*)
      `)
      .not('next_followup_date', 'is', null)
      .gte('next_followup_date', new Date().toISOString().split('T')[0])
      .order('next_followup_date', { ascending: true })
      .limit(10);
    
    if (followupsError) throw followupsError;

    return {
      totalLeads,
      totalCallsToday,
      pendingDocs: inProgressLeads, // Renamed for compatibility
      conversionRate,
      approvalsByBank: leadsByStatus, // Using status instead of bank
      leadsByCreditType: leadsByCity, // Using city instead of credit type
      callsByRep,
      recentLeads,
      upcomingFollowups: upcomingFollowups || []
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

// ===== EXPORT DATA =====

export const exportLeadsToCSV = (leads: Lead[]): string => {
  const headers = [
    'Name', 'Phone', 'Email', 'Credit Type', 'Bank Partner', 
    'Requested Amount', 'Term (Months)', 'Interest Rate', 'Status', 
    'Assigned To', 'Priority', 'Created At'
  ];
  
  const rows = leads.map(lead => [
    lead.name,
    lead.phone,
    lead.email || '',
    lead.credit_type,
    lead.bank_partner,
    lead.requested_amount?.toString() || '',
    lead.term_months?.toString() || '',
    lead.interest_rate_range || '',
    lead.application_status,
    (lead.sales_rep as any)?.name || '',
    lead.priority || '',
    new Date(lead.created_at).toLocaleDateString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};
