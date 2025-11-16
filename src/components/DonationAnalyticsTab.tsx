// ============================================================================
// ADMIN COMPONENT: Donation Analytics Tab (Simplified)
// Location: mosque-admin-dashboard/src/components/DonationAnalyticsTab.tsx
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Download, RefreshCw, DollarSign, TrendingUp, Calendar, Repeat } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Timestamp } from 'firebase/firestore';
import Card from './ui/Card';
import { Theme, media } from '../constants/theme';

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
  date: Timestamp;
  created_at: Timestamp;
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

const Container = Card;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${Theme.spacing.xl};
`;

const Title = styled.h2`
  font-size: ${Theme.typography.h2};
  font-weight: 700;
  color: ${Theme.colors.text.strong};
  margin: 0;

  ${media.sm} { font-size: ${Theme.typography.h1}; }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 44px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${props => props.$variant === 'primary' ? Theme.colors.brand.navy[700] : Theme.colors.surface.muted};
  color: ${props => props.$variant === 'primary' ? 'white' : Theme.colors.text.strong};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'primary' ? Theme.colors.brand.navy[600] : Theme.colors.surface.base};
    box-shadow: ${Theme.shadow.soft};
  }

  &:disabled {
    background: ${Theme.colors.border.medium};
    cursor: not-allowed;
    color: white;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${Theme.spacing.xl};
  margin-bottom: ${Theme.spacing.xl};
`;

const SummaryCard = styled.div<{ color: string }>`
  background: ${Theme.colors.surface.card};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  box-shadow: ${Theme.shadow.soft};
  border-left: 4px solid ${props => props.color};

  &:hover { box-shadow: ${Theme.shadow.card}; }
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
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.muted};
  margin-bottom: ${Theme.spacing.xs};
`;

const SummaryValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: ${Theme.colors.text.strong};
`;

const SummarySubtext = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.subtle};
  margin-top: ${Theme.spacing.sm};
`;

const TableSection = styled.div`
  background: ${Theme.colors.surface.card};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  box-shadow: ${Theme.shadow.soft};
  overflow-x: auto;
  margin-bottom: ${Theme.spacing.xl};

  &:hover { box-shadow: ${Theme.shadow.card}; }
`;

const SectionTitle = styled.h3`
  font-size: ${Theme.typography.h3};
  font-weight: 700;
  color: ${Theme.colors.text.strong};
  margin: 0 0 ${Theme.spacing.md} 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: ${Theme.spacing.md};
  border-bottom: 2px solid ${Theme.colors.border.base};
  font-weight: 700;
  color: ${Theme.colors.text.strong};
  font-size: ${Theme.typography.small};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: ${Theme.spacing.md};
  border-bottom: 1px solid ${Theme.colors.surface.muted};
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.muted};
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: ${Theme.spacing.xs} ${Theme.spacing.lg};
  border-radius: ${Theme.radius.pill};
  font-size: ${Theme.typography.small};
  font-weight: 700;
  background: ${props => 
    props.status === 'succeeded' || props.status === 'active' ? Theme.colors.status.successLight :
    props.status === 'pending' ? Theme.colors.status.warning :
    props.status === 'failed' ? Theme.colors.status.errorLight :
    Theme.colors.surface.muted
  };
  color: ${props =>
    props.status === 'succeeded' || props.status === 'active' ? Theme.colors.status.successDark :
    props.status === 'pending' ? Theme.colors.text.strong :
    props.status === 'failed' ? Theme.colors.status.errorDark :
    Theme.colors.text.muted
  };
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${Theme.colors.text.muted};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${Theme.colors.text.muted};
  font-size: ${Theme.typography.h3};
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

// Convert Firestore Timestamp to YYYY-MM-DD string
const timestampToDateString = (timestamp: Timestamp): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate donations for a period
const calculatePeriodTotal = (
  donations: DonationRecord[],
  startDate: string,
  endDate: string
): number => {
  return donations
    .filter(d => {
      if (d.payment_status !== 'succeeded') return false;
      const dateStr = timestampToDateString(d.date);
      return dateStr >= startDate && dateStr <= endDate;
    })
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

  const loadAnalytics = useCallback(async () => {
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
  }, [onSaveStatusChange]);

  // Load data on mount
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExportCSV = () => {
    if (!data || !data.donations.length) return;

    const csvData = data.donations
      .filter(d => d.payment_status === 'succeeded')
      .map(d => ({
        'Receipt Number': d.receipt_number,
        'Date': timestampToDateString(d.date),
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
    // Use local date for filename to match user's timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    a.download = `donations-${year}-${month}-${day}.csv`;
    a.click();
  };

  // Format currency
  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date - handles both Timestamp and string
  const formatDate = (timestamp: Timestamp): string => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(timestamp || '');
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
