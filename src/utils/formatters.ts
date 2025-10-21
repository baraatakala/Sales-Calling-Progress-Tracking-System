// Utility functions for formatting data

export const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDuration = (minutes: number | undefined): string => {
  if (!minutes) return '0 min';
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatPhoneNumber = (phone: string): string => {
  // Format UAE phone numbers
  if (phone.startsWith('+971')) {
    return phone.replace(/(\+971)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  return phone;
};

export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    'New': '#3b82f6',
    'In Progress': '#f59e0b',
    'Converted': '#22c55e',
    'Lost': '#ef4444'
  };
  return statusColors[status] || '#94a3b8';
};

export const getPriorityColor = (priority: string | undefined): string => {
  const priorityColors: { [key: string]: string } = {
    'Low': '#22c55e',
    'Medium': '#fbbf24',
    'High': '#ef4444'
  };
  return priorityColors[priority || 'Medium'] || '#fbbf24';
};

export const getOutcomeColor = (outcome: string): string => {
  const outcomeColors: { [key: string]: string } = {
    'Converted': '#22c55e',
    'Interested': '#3b82f6',
    'Callback Requested': '#f59e0b',
    'Not Interested': '#ef4444',
    'No Answer': '#94a3b8'
  };
  return outcomeColors[outcome] || '#94a3b8';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
