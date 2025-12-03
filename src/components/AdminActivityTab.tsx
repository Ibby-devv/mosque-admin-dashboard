import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Theme } from '../constants/theme';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { Activity, Filter, Calendar, User, Shield, Mail, Key, Clock, CheckCircle, XCircle } from 'lucide-react';
import Loading from './ui/Loading';
import Pagination from './ui/Pagination';

const Container = styled.div`
  padding: ${Theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const PageTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: ${Theme.colors.text.base};
  margin-bottom: ${Theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.md};
`;

const Description = styled.p`
  font-size: ${Theme.typography.body};
  color: ${Theme.colors.text.muted};
  margin-bottom: ${Theme.spacing.xl};
`;

const FilterSection = styled.div`
  background: ${Theme.colors.surface.card};
  border-radius: ${Theme.radius.lg};
  padding: ${Theme.spacing.lg};
  margin-bottom: ${Theme.spacing.xl};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FilterGrid = styled.div`
  display: grid;
  gap: ${Theme.spacing.md};
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  /* Prevent grid items from overflowing */
  > * {
    min-width: 0;
  }
`;

const FilterGroup = styled.div`
  min-width: 0;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-size: ${Theme.typography.small};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.sm};
`;

const Select = styled.select`
  width: 100%;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  min-height: 44px;
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  background: ${Theme.colors.surface.base};
  cursor: pointer;

  &:hover {
    border-color: ${Theme.colors.brand.navy[600]};
  }

  &:focus {
    border-color: ${Theme.colors.brand.navy[600]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }
`;

const Input = styled.input`
  width: 100%;
  max-width: 100%;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  min-height: 44px;
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:hover {
    border-color: ${Theme.colors.brand.navy[600]};
  }

  &:focus {
    border-color: ${Theme.colors.brand.navy[600]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }
`;

const TableSection = styled.div`
  background: ${Theme.colors.surface.card};
  border-radius: ${Theme.radius.lg};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${Theme.typography.body};
`;

const TableHead = styled.thead`
  background: ${Theme.colors.surface.soft};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${Theme.colors.border.base};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${Theme.colors.surface.soft};
  }
`;

const TableHeader = styled.th`
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  text-align: left;
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  color: ${Theme.colors.text.base};
`;

const ActionBadge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
  padding: ${Theme.spacing.xs} ${Theme.spacing.sm};
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
  font-weight: 600;
  white-space: nowrap;
  
  ${props => {
    switch (props.$type) {
      case 'user_created':
        return `
          background: ${Theme.colors.status.successLight};
          color: ${Theme.colors.status.successDark};
        `;
      case 'invite_sent':
      case 'verification_sent':
        return `
          background: ${Theme.colors.accent.blueSoft};
          color: ${Theme.colors.accent.blueDark};
        `;
      case 'password_reset_sent':
        return `
          background: ${Theme.colors.accent.amberSoft};
          color: ${Theme.colors.accent.amber};
        `;
      case 'roles_updated':
      case 'roles_removed':
        return `
          background: ${Theme.colors.accent.blueSoft};
          color: ${Theme.colors.brand.navy[800]};
        `;
      default:
        return `
          background: ${Theme.colors.border.base};
          color: ${Theme.colors.text.muted};
        `;
    }
  }}
`;

const StatusIcon = styled.span<{ $success: boolean }>`
  display: inline-flex;
  align-items: center;
  color: ${props => props.$success ? Theme.colors.status.success : Theme.colors.status.error};
`;

const EmptyState = styled.div`
  padding: ${Theme.spacing.xxl};
  text-align: center;
  color: ${Theme.colors.text.muted};
`;

const EmptyStateIcon = styled.div`
  margin-bottom: ${Theme.spacing.lg};
  color: ${Theme.colors.text.muted};
`;

const EmptyStateText = styled.p`
  font-size: ${Theme.typography.body};
`;

interface AdminLog {
  id: string;
  action: 'user_created' | 'invite_sent' | 'password_reset_sent' | 'verification_sent' | 'roles_updated' | 'roles_removed';
  targetUser: string;
  targetEmail: string;
  performedBy: string;
  performedByEmail: string;
  timestamp: Timestamp;
  emailSent?: boolean;
  roles?: string[];
  newRoles?: string[];
  removedRoles?: string[] | string;
}

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  user_created: { label: 'User Created', icon: <User size={14} /> },
  invite_sent: { label: 'Invite Sent', icon: <Mail size={14} /> },
  password_reset_sent: { label: 'Password Reset', icon: <Key size={14} /> },
  verification_sent: { label: 'Verification Sent', icon: <Mail size={14} /> },
  roles_updated: { label: 'Roles Updated', icon: <Shield size={14} /> },
  roles_removed: { label: 'Roles Removed', icon: <Shield size={14} /> },
};

const ITEMS_PER_PAGE = 50;

export default function AdminActivityTab(): React.JSX.Element {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Real-time listener for admin logs
  useEffect(() => {
    setLoading(true);
    
    let q = query(
      collection(db, 'adminLogs'),
      orderBy('timestamp', 'desc'),
      limit(500) // Limit to recent 500 logs for performance
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData: AdminLog[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AdminLog));
        
        setLogs(logsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching admin logs:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter logs based on selected filters
  const filteredLogs = logs.filter(log => {
    // Action filter
    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== 'all' && log.timestamp) {
      const logDate = log.timestamp.toDate();
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      if (dateFilter === 'today' && logDate < dayAgo) return false;
      if (dateFilter === 'week' && logDate < weekAgo) return false;
      if (dateFilter === 'month' && logDate < monthAgo) return false;
    }

    // Email search filter
    if (searchEmail.trim() !== '') {
      const search = searchEmail.toLowerCase().trim();
      const targetMatch = log.targetEmail?.toLowerCase().includes(search);
      const performerMatch = log.performedByEmail?.toLowerCase().includes(search);
      if (!targetMatch && !performerMatch) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, dateFilter, searchEmail]);

  const formatTimestamp = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getActionDetails = (log: AdminLog): string => {
    switch (log.action) {
      case 'user_created':
        return log.roles && log.roles.length > 0 
          ? `Roles: ${log.roles.join(', ')}`
          : 'No roles assigned';
      case 'roles_updated':
        return log.newRoles && log.newRoles.length > 0
          ? `New roles: ${log.newRoles.join(', ')}`
          : 'All roles removed';
      case 'roles_removed':
        if (log.removedRoles === 'all') return 'All roles removed';
        return Array.isArray(log.removedRoles)
          ? `Removed: ${log.removedRoles.join(', ')}`
          : 'Roles removed';
      case 'invite_sent':
      case 'password_reset_sent':
      case 'verification_sent':
        return log.emailSent !== undefined
          ? (log.emailSent ? 'Email sent successfully' : 'Email failed to send')
          : 'Email status unknown';
      default:
        return '';
    }
  };

  if (loading) {
    return <Loading fullPage text="Loading activity logs..." />;
  }

  return (
    <Container>
      <PageTitle>
        <Activity size={28} />
        Admin Activity Dashboard
      </PageTitle>
      <Description>
        Monitor recent administrative actions including user creation, role changes, and email notifications.
        Showing the {filteredLogs.length} most recent activities.
      </Description>

      <FilterSection>
        <FilterGrid>
          <FilterGroup>
            <Label>
              <Filter size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Filter by Action
            </Label>
            <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="all">All Actions</option>
              <option value="user_created">User Created</option>
              <option value="invite_sent">Invite Sent</option>
              <option value="password_reset_sent">Password Reset</option>
              <option value="verification_sent">Verification Sent</option>
              <option value="roles_updated">Roles Updated</option>
              <option value="roles_removed">Roles Removed</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>
              <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Filter by Date
            </Label>
            <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>
              <User size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Search by Email
            </Label>
            <Input
              type="text"
              placeholder="Search target or performer email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </FilterGroup>
        </FilterGrid>
      </FilterSection>

      <TableSection>
        <TableContainer>
          {paginatedLogs.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <Activity size={48} />
              </EmptyStateIcon>
              <EmptyStateText>
                {logs.length === 0 
                  ? 'No admin activity logs found. Actions will appear here as they occur.'
                  : 'No activities match your current filters. Try adjusting the filters above.'}
              </EmptyStateText>
            </EmptyState>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Action</TableHeader>
                  <TableHeader>Target User</TableHeader>
                  <TableHeader>Performed By</TableHeader>
                  <TableHeader>Details</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>
                    <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Time
                  </TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {paginatedLogs.map((log) => {
                  const actionInfo = ACTION_LABELS[log.action] || { label: log.action, icon: <Activity size={14} /> };
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <ActionBadge $type={log.action}>
                          {actionInfo.icon}
                          {actionInfo.label}
                        </ActionBadge>
                      </TableCell>
                      <TableCell>
                        {log.targetEmail || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {log.performedByEmail || 'System'}
                      </TableCell>
                      <TableCell style={{ fontSize: Theme.typography.small, color: Theme.colors.text.muted }}>
                        {getActionDetails(log)}
                      </TableCell>
                      <TableCell>
                        {log.emailSent !== undefined && (
                          <StatusIcon $success={log.emailSent}>
                            {log.emailSent ? <CheckCircle size={18} /> : <XCircle size={18} />}
                          </StatusIcon>
                        )}
                      </TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', color: Theme.colors.text.muted }}>
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          )}
        </TableContainer>

        {totalPages > 1 && (
          <div style={{ padding: Theme.spacing.lg, borderTop: `1px solid ${Theme.colors.border.base}` }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredLogs.length}
            />
          </div>
        )}
      </TableSection>
    </Container>
  );
}
