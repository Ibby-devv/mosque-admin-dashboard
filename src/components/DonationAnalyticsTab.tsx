// ============================================================================
// ADMIN COMPONENT: Donation Analytics Tab (Simplified)
// Location: mosque-admin-dashboard/src/components/DonationAnalyticsTab.tsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Download, RefreshCw, DollarSign, TrendingUp, Calendar, Repeat } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

// ============================================================================
// TYPES
// ============================================================================

interface DonationRecord {
  id: string;
  receipt_number: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  currency: string;
  donation_type_label: string;
  payment_status: string;
  is_recurring: boolean;
  date: string;
  created_at: any;
}

interface RecurringDonationRecord {
  id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  frequency: string;
  status: string;
  donation_type_label: string;
}

interface AnalyticsSummary {
  totalAmount: number;
  byMonth: { [key: string]: { count: number; amount: number } };
}

interface DonationAnalyticsResponse {
  donations: DonationRecord[];
  recurringDonations: RecurringDonationRecord[];
  summary: AnalyticsSummary;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${props => props.$variant === 'primary' ? '#1e3a8a' : '#f3f4f6'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#374151'};

  &:hover {
    background: ${props => props.$variant === 'primary' ? '#1e40af' : '#e5e7eb'};
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    color: white;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div<{ color: string }>`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color};
`;

const SummaryIcon = styled.div<{ color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${props => props.color};
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const SummaryValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
`;

const SummarySubtext = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
`;

const TableSection = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => 
    props.status === 'succeeded' ? '#d1fae5' :
    props.status === 'active' ? '#d1fae5' :
    props.status === 'pending' ? '#fef3c7' :
    props.status === 'failed' ? '#fee2e2' :
    '#f3f4f6'
  };
  color: ${props =>
    props.status === 'succeeded' ? '#065f46' :
    props.status === 'active' ? '#065f46' :
    props.status === 'pending' ? '#92400e' :
    props.status === 'failed' ? '#991b1b' :
    '#374151'
  };
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.125rem;
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get date range for different periods
const getDateRange = (period: 'today' | 'week' | 'month' | 'year') => {
  const now = new Date();
  const sydneyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
  
  const year = sydneyTime.getFullYear();
  const month = String(sydneyTime.getMonth() + 1).padStart(2, '0');
  const day = String(sydneyTime.getDate()).padStart(2, '0');
  
  const today = `${year}-${month}-${day}`;
  
  if (period === 'today') {
    return { start: today, end: today };
  }
  
  if (period === 'week') {
    const weekAgo = new Date(sydneyTime);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStart = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
    return { start: weekStart, end: today };
  }
  
  if (period === 'month') {
    const monthStart = `${year}-${month}-01`;
    return { start: monthStart, end: today };
  }
  
  if (period === 'year') {
    const yearStart = `${year}-01-01`;
    return { start: yearStart, end: today };
  }
  
  return { start: today, end: today };
};

// Calculate donations for a period
const calculatePeriodTotal = (
  donations: DonationRecord[],
  startDate: string,
  endDate: string
): number => {
  return donations
    .filter(d => 
      d.payment_status === 'succeeded' &&
      d.date >= startDate &&
      d.date <= endDate
    )
    .reduce((sum, d) => sum + d.amount, 0);
};

// ============================================================================
// COMPONENT
// ============================================================================

interface DonationAnalyticsTabProps {
  saving: boolean;
  onSaveStatusChange: (success: boolean) => void;
}

export default function DonationAnalyticsTab({
  saving,
  onSaveStatusChange,
}: DonationAnalyticsTabProps): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DonationAnalyticsResponse | null>(null);

  // Load data on mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const functions = getFunctions(undefined, 'australia-southeast1');
      const getDonationAnalytics = httpsCallable<any, DonationAnalyticsResponse>(
        functions,
        'getDonationAnalytics'
      );

      const result = await getDonationAnalytics({
        limit: 100,
        offset: 0,
      });

      setData(result.data);
      console.log('✅ Analytics loaded:', result.data);
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      onSaveStatusChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data || !data.donations.length) return;

    const csvData = data.donations
      .filter(d => d.payment_status === 'succeeded')
      .map(d => ({
        'Receipt Number': d.receipt_number,
        'Date': d.date,
        'Donor Name': d.donor_name,
        'Donor Email': d.donor_email,
        'Amount': `$${(d.amount / 100).toFixed(2)}`,
        'Type': d.donation_type_label,
        'Recurring': d.is_recurring ? 'Yes' : 'No',
      }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Format currency
  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Calculate period totals
  const todayRange = getDateRange('today');
  const weekRange = getDateRange('week');
  const monthRange = getDateRange('month');
  const yearRange = getDateRange('year');

  const todayTotal = data ? calculatePeriodTotal(data.donations, todayRange.start, todayRange.end) : 0;
  const weekTotal = data ? calculatePeriodTotal(data.donations, weekRange.start, weekRange.end) : 0;
  const monthTotal = data ? calculatePeriodTotal(data.donations, monthRange.start, monthRange.end) : 0;
  const yearTotal = data ? calculatePeriodTotal(data.donations, yearRange.start, yearRange.end) : 0;

  // Calculate recurring monthly total
  const recurringMonthlyTotal = data
    ? data.recurringDonations
        .filter(r => r.status === 'active')
        .reduce((sum, r) => {
          // Convert to monthly amount
          const monthlyAmount = 
            r.frequency === 'weekly' ? r.amount * 4.33 :
            r.frequency === 'fortnightly' ? r.amount * 2.17 :
            r.frequency === 'monthly' ? r.amount :
            r.frequency === 'yearly' ? r.amount / 12 :
            0;
          return sum + monthlyAmount;
        }, 0)
    : 0;

  const activeRecurringCount = data
    ? data.recurringDonations.filter(r => r.status === 'active').length
    : 0;

  if (loading) {
    return (
      <Container>
        <LoadingState>Loading donation analytics...</LoadingState>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <EmptyState>
          <p>Failed to load analytics data.</p>
          <Button $variant="primary" onClick={loadAnalytics}>
            <RefreshCw size={20} />
            Retry
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Donation Analytics</Title>
        <ButtonGroup>
          <Button onClick={handleExportCSV}>
            <Download size={20} />
            Export CSV
          </Button>
          <Button $variant="primary" onClick={loadAnalytics}>
            <RefreshCw size={20} />
            Refresh
          </Button>
        </ButtonGroup>
      </Header>

      {/* Summary Cards */}
      <SummaryGrid>
        <SummaryCard color="#10b981">
          <SummaryIcon color="#10b981">
            <DollarSign size={24} />
          </SummaryIcon>
          <SummaryLabel>Today</SummaryLabel>
          <SummaryValue>{formatCurrency(todayTotal)}</SummaryValue>
          <SummarySubtext>{todayRange.start}</SummarySubtext>
        </SummaryCard>

        <SummaryCard color="#3b82f6">
          <SummaryIcon color="#3b82f6">
            <TrendingUp size={24} />
          </SummaryIcon>
          <SummaryLabel>This Week</SummaryLabel>
          <SummaryValue>{formatCurrency(weekTotal)}</SummaryValue>
          <SummarySubtext>Last 7 days</SummarySubtext>
        </SummaryCard>

        <SummaryCard color="#8b5cf6">
          <SummaryIcon color="#8b5cf6">
            <Calendar size={24} />
          </SummaryIcon>
          <SummaryLabel>This Month</SummaryLabel>
          <SummaryValue>{formatCurrency(monthTotal)}</SummaryValue>
          <SummarySubtext>{monthRange.start} to {monthRange.end}</SummarySubtext>
        </SummaryCard>

        <SummaryCard color="#f59e0b">
          <SummaryIcon color="#f59e0b">
            <TrendingUp size={24} />
          </SummaryIcon>
          <SummaryLabel>Year to Date</SummaryLabel>
          <SummaryValue>{formatCurrency(yearTotal)}</SummaryValue>
          <SummarySubtext>{yearRange.start} to {yearRange.end}</SummarySubtext>
        </SummaryCard>

        <SummaryCard color="#ec4899">
          <SummaryIcon color="#ec4899">
            <Repeat size={24} />
          </SummaryIcon>
          <SummaryLabel>Recurring Per Month</SummaryLabel>
          <SummaryValue>{formatCurrency(recurringMonthlyTotal)}</SummaryValue>
          <SummarySubtext>{activeRecurringCount} active subscriptions</SummarySubtext>
        </SummaryCard>
      </SummaryGrid>

      {/* Recent Donations Table */}
      <TableSection>
        <SectionTitle>Recent Donations (Last 20)</SectionTitle>
        {data.donations.length === 0 ? (
          <EmptyState>No donations found.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Receipt #</Th>
                <Th>Donor</Th>
                <Th>Amount</Th>
                <Th>Type</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {data.donations.slice(0, 20).map((donation) => (
                <tr key={donation.id}>
                  <Td>{formatDate(donation.date)}</Td>
                  <Td style={{ fontWeight: 600, color: '#1f2937' }}>{donation.receipt_number}</Td>
                  <Td style={{ fontWeight: 500 }}>{donation.donor_name}</Td>
                  <Td style={{ fontWeight: 600 }}>{formatCurrency(donation.amount)}</Td>
                  <Td>{donation.donation_type_label}</Td>
                  <Td>
                    <StatusBadge status={donation.payment_status}>
                      {donation.payment_status}
                    </StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableSection>

      {/* Active Recurring Donations Table */}
      <TableSection>
        <SectionTitle>Active Recurring Donations</SectionTitle>
        {data.recurringDonations.filter(r => r.status === 'active').length === 0 ? (
          <EmptyState>No active recurring donations.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Donor</Th>
                <Th>Amount</Th>
                <Th>Frequency</Th>
                <Th>Type</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {data.recurringDonations
                .filter(r => r.status === 'active')
                .map((recurring) => (
                  <tr key={recurring.id}>
                    <Td style={{ fontWeight: 500 }}>{recurring.donor_name}</Td>
                    <Td style={{ fontWeight: 600 }}>{formatCurrency(recurring.amount)}</Td>
                    <Td style={{ textTransform: 'capitalize' }}>{recurring.frequency}</Td>
                    <Td>{recurring.donation_type_label}</Td>
                    <Td>
                      <StatusBadge status={recurring.status}>
                        {recurring.status}
                      </StatusBadge>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </TableSection>
    </Container>
  );
}
