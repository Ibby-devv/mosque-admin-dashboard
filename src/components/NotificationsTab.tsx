// ============================================================================
// ADMIN COMPONENT: Notifications Tab (Enhanced with Delete)
// Location: mosque-admin-dashboard/src/components/NotificationsTab.tsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Bell, CheckCircle, AlertCircle, Clock, Users, Trash2, AlertTriangle } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// TYPES
// ============================================================================

interface NotificationFormData {
  title: string;
  body: string;
  data?: {
    type?: string;
    link?: string;
    [key: string]: any;
  };
}

interface NotificationLog {
  id: string;
  type: string;
  title: string;
  body: string;
  sentBy?: string;
  sentTo: number;
  successCount: number;
  failureCount: number;
  sentAt: any;
  data?: any;
}

interface SendNotificationResponse {
  success: boolean;
  message: string;
  sentCount: number;
  failedCount: number;
  totalTokens: number;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  padding: 0;
`;

const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const CharacterCount = styled.span<{ $isNearLimit: boolean; $isOverLimit: boolean }>`
  font-size: 0.75rem;
  color: ${props => 
    props.$isOverLimit ? '#dc2626' : 
    props.$isNearLimit ? '#f59e0b' : 
    '#6b7280'
  };
  font-weight: ${props => (props.$isOverLimit || props.$isNearLimit) ? 600 : 400};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.$hasError ? '#dc2626' : '#d1d5db'};
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${props => props.$hasError ? '#dc2626' : '#1e3a8a'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(30, 58, 138, 0.1)'};
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.$hasError ? '#dc2626' : '#d1d5db'};
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: ${props => props.$hasError ? '#dc2626' : '#1e3a8a'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(30, 58, 138, 0.1)'};
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ErrorMessage = styled.div`
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
`;

const HelpText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const PreviewCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
`;

const PreviewTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NotificationPreview = styled.div`
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const PreviewNotificationTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const PreviewNotificationBody = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  font-size: 1rem;

  background: ${props => props.$variant === 'secondary' ? '#f3f4f6' : '#1e3a8a'};
  color: ${props => props.$variant === 'secondary' ? '#374151' : 'white'};

  &:hover {
    background: ${props => props.$variant === 'secondary' ? '#e5e7eb' : '#1e40af'};
  }

  &:disabled {
    background: #9ca3af;
    color: white;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const WarningBox = styled.div`
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const WarningIcon = styled.div`
  color: #f59e0b;
  flex-shrink: 0;
`;

const WarningText = styled.div`
  font-size: 0.875rem;
  color: #92400e;
`;

const SuccessBox = styled.div`
  background: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const SuccessIcon = styled.div`
  color: #10b981;
  flex-shrink: 0;
`;

const SuccessContent = styled.div`
  flex: 1;
`;

const SuccessTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.25rem;
`;

const SuccessText = styled.div`
  font-size: 0.75rem;
  color: #047857;
`;

const ErrorBox = styled.div`
  background: #fee2e2;
  border: 1px solid #dc2626;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const ErrorIcon = styled.div`
  color: #dc2626;
  flex-shrink: 0;
`;

const ErrorContent = styled.div`
  flex: 1;
`;

const ErrorTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 0.25rem;
`;

const ErrorText = styled.div`
  font-size: 0.75rem;
  color: #b91c1c;
`;

const RecentNotificationsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const RecentNotificationsTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const DeleteAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fecaca;
    border-color: #f87171;
  }

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;
    cursor: not-allowed;
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NotificationLogItem = styled.div`
  border: 1px solid #e5e7eb;
  border-left: 4px solid #3b82f6;
  border-radius: 0.5rem;
  padding: 1rem;
  background: white;
  position: relative;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const LogTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  padding-right: 1rem;
`;

const LogActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const LogTimestamp = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fecaca;
    border-color: #f87171;
  }

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;
    cursor: not-allowed;
  }
`;

const LogBody = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
`;

const LogStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
`;

const LogStat = styled.div<{ $success?: boolean }>`
  color: ${props => props.$success ? '#059669' : '#6b7280'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const EmptyStateIcon = styled.div`
  margin-bottom: 1rem;
  color: #d1d5db;
`;

const EmptyStateText = styled.div`
  font-size: 0.875rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

// ============================================================================
// COMPONENT
// ============================================================================

interface NotificationsTabProps {
  saving: boolean;
  onSaveStatusChange: (success: boolean) => void;
}

export default function NotificationsTab({
  saving,
  onSaveStatusChange,
}: NotificationsTabProps): React.JSX.Element {
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    body: '',
    data: {
      type: 'announcement',
    },
  });

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    data?: SendNotificationResponse;
  } | null>(null);

  const [recentNotifications, setRecentNotifications] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [deletingLog, setDeletingLog] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    body?: string;
  }>({});

  // Character limits
  const TITLE_LIMIT = 100;
  const BODY_LIMIT = 500;

  // Load recent notifications
  useEffect(() => {
    loadRecentNotifications();
  }, []);

  const loadRecentNotifications = async () => {
    try {
      setLoadingLogs(true);
      const logsRef = collection(db, 'notificationLogs');
      const q = query(logsRef, orderBy('sentAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);

      const logs: NotificationLog[] = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as NotificationLog);
      });

      setRecentNotifications(logs);
      console.log(`✅ Loaded ${logs.length} notification logs`);
    } catch (error) {
      console.error('Error loading notification logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleInputChange = (field: keyof NotificationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Clear send result when user starts typing again
    if (sendResult) {
      setSendResult(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > TITLE_LIMIT) {
      newErrors.title = `Title must be ${TITLE_LIMIT} characters or less`;
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Message is required';
    } else if (formData.body.length > BODY_LIMIT) {
      newErrors.body = `Message must be ${BODY_LIMIT} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendNotification = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    const confirmed = window.confirm(
      `Send notification to ALL users?\n\nTitle: ${formData.title}\nMessage: ${formData.body}\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      // Initialize Firebase Functions for australia-southeast1 region
      const functions = getFunctions(undefined, 'australia-southeast1');
      const sendCustomNotification = httpsCallable<NotificationFormData, SendNotificationResponse>(
        functions,
        'sendCustomNotification'
      );

      console.log('Sending notification:', formData);

      const result = await sendCustomNotification({
        title: formData.title.trim(),
        body: formData.body.trim(),
        data: formData.data,
      });

      console.log('Notification sent successfully:', result.data);

      setSendResult({
        success: true,
        message: `Successfully sent to ${result.data.sentCount} users!`,
        data: result.data,
      });

      // Clear form
      setFormData({
        title: '',
        body: '',
        data: { type: 'announcement' },
      });

      // Reload notification logs
      loadRecentNotifications();

      // Trigger parent success callback
      onSaveStatusChange(true);
    } catch (error: any) {
      console.error('Error sending notification:', error);

      setSendResult({
        success: false,
        message: error.message || 'Failed to send notification. Please try again.',
      });

      onSaveStatusChange(false);
    } finally {
      setSending(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      title: '',
      body: '',
      data: { type: 'announcement' },
    });
    setErrors({});
    setSendResult(null);
  };

  const handleDeleteLog = async (logId: string) => {
    const confirmed = window.confirm(
      'Delete this notification log?\n\nThis will only remove the log from history. It will not unsend the notification.'
    );

    if (!confirmed) {
      return;
    }

    setDeletingLog(logId);

    try {
      await deleteDoc(doc(db, 'notificationLogs', logId));
      console.log('✅ Notification log deleted:', logId);
      
      // Remove from state
      setRecentNotifications(prev => prev.filter(log => log.id !== logId));
      
      onSaveStatusChange(true);
    } catch (error) {
      console.error('❌ Error deleting notification log:', error);
      onSaveStatusChange(false);
      alert('Failed to delete notification log. Please try again.');
    } finally {
      setDeletingLog(null);
    }
  };

  const handleDeleteAllLogs = async () => {
    const confirmed = window.confirm(
      `Delete ALL ${recentNotifications.length} notification logs?\n\nThis will permanently remove all notification history. This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    // Double confirmation for safety
    const doubleConfirmed = window.confirm(
      '⚠️ FINAL CONFIRMATION\n\nAre you absolutely sure you want to delete ALL notification logs?'
    );

    if (!doubleConfirmed) {
      return;
    }

    setDeletingAll(true);

    try {
      // Delete all logs
      const deletePromises = recentNotifications.map(log =>
        deleteDoc(doc(db, 'notificationLogs', log.id))
      );

      await Promise.all(deletePromises);

      console.log(`✅ Deleted ${recentNotifications.length} notification logs`);
      
      // Clear state
      setRecentNotifications([]);
      
      onSaveStatusChange(true);
    } catch (error) {
      console.error('❌ Error deleting all notification logs:', error);
      onSaveStatusChange(false);
      alert('Failed to delete all logs. Some logs may have been deleted.');
      // Reload to see what's left
      loadRecentNotifications();
    } finally {
      setDeletingAll(false);
    }
  };

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Unknown';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const titleNearLimit = formData.title.length >= TITLE_LIMIT * 0.8;
  const titleOverLimit = formData.title.length > TITLE_LIMIT;
  const bodyNearLimit = formData.body.length >= BODY_LIMIT * 0.8;
  const bodyOverLimit = formData.body.length > BODY_LIMIT;

  const hasPreviewContent = formData.title.trim() || formData.body.trim();

  return (
    <Container>
      <Card>
        <CardTitle>Send Push Notification</CardTitle>
        <CardDescription>
          Send a custom notification to all users who have notifications enabled in the mobile app.
        </CardDescription>

        {/* Success Message */}
        {sendResult?.success && (
          <SuccessBox>
            <SuccessIcon>
              <CheckCircle size={20} />
            </SuccessIcon>
            <SuccessContent>
              <SuccessTitle>Notification Sent Successfully!</SuccessTitle>
              <SuccessText>
                {sendResult.message}
                {sendResult.data && ` (${sendResult.data.failedCount} failed)`}
              </SuccessText>
            </SuccessContent>
          </SuccessBox>
        )}

        {/* Error Message */}
        {sendResult && !sendResult.success && (
          <ErrorBox>
            <ErrorIcon>
              <AlertCircle size={20} />
            </ErrorIcon>
            <ErrorContent>
              <ErrorTitle>Failed to Send Notification</ErrorTitle>
              <ErrorText>{sendResult.message}</ErrorText>
            </ErrorContent>
          </ErrorBox>
        )}

        <Form>
          {/* Title Field */}
          <FormGroup>
            <Label>
              Notification Title *{' '}
              <CharacterCount 
                $isNearLimit={titleNearLimit} 
                $isOverLimit={titleOverLimit}
              >
                ({formData.title.length}/{TITLE_LIMIT})
              </CharacterCount>
            </Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Emergency: Jummah Cancelled"
              maxLength={TITLE_LIMIT + 10}
              $hasError={!!errors.title}
            />
            {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            <HelpText>
              Keep it short and clear. This appears as the notification heading.
            </HelpText>
          </FormGroup>

          {/* Body Field */}
          <FormGroup>
            <Label>
              Message *{' '}
              <CharacterCount 
                $isNearLimit={bodyNearLimit} 
                $isOverLimit={bodyOverLimit}
              >
                ({formData.body.length}/{BODY_LIMIT})
              </CharacterCount>
            </Label>
            <TextArea
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="e.g., Due to severe weather conditions, today's Jummah prayer is cancelled. Please pray Dhuhr at home."
              maxLength={BODY_LIMIT + 50}
              $hasError={!!errors.body}
            />
            {errors.body && <ErrorMessage>{errors.body}</ErrorMessage>}
            <HelpText>
              Provide clear details about what users need to know.
            </HelpText>
          </FormGroup>

          {/* Preview */}
          {hasPreviewContent && (
            <PreviewCard>
              <PreviewTitle>
                <Bell size={16} />
                Preview
              </PreviewTitle>
              <NotificationPreview>
                <PreviewNotificationTitle>
                  {formData.title || 'Notification Title'}
                </PreviewNotificationTitle>
                <PreviewNotificationBody>
                  {formData.body || 'Notification message will appear here...'}
                </PreviewNotificationBody>
              </NotificationPreview>
            </PreviewCard>
          )}

          {/* Warning */}
          <WarningBox>
            <WarningIcon>
              <AlertCircle size={20} />
            </WarningIcon>
            <WarningText>
              <strong>Important:</strong> This notification will be sent to ALL users who have 
              notifications enabled. Please review your message carefully before sending.
            </WarningText>
          </WarningBox>

          {/* Buttons */}
          <ButtonGroup>
            <Button
              $variant="secondary"
              onClick={handleClearForm}
              disabled={sending}
              type="button"
            >
              Clear Form
            </Button>
            <Button
              $variant="primary"
              onClick={handleSendNotification}
              disabled={sending || !formData.title.trim() || !formData.body.trim()}
              type="button"
            >
              {sending ? (
                <>
                  <Clock size={20} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send to All Users
                </>
              )}
            </Button>
          </ButtonGroup>
        </Form>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <RecentNotificationsHeader>
          <RecentNotificationsTitle>
            Recent Notifications ({recentNotifications.length})
          </RecentNotificationsTitle>
          {recentNotifications.length > 0 && (
            <DeleteAllButton
              onClick={handleDeleteAllLogs}
              disabled={deletingAll || loadingLogs}
            >
              {deletingAll ? (
                <>
                  <Clock size={16} />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete All
                </>
              )}
            </DeleteAllButton>
          )}
        </RecentNotificationsHeader>

        {loadingLogs ? (
          <LoadingState>Loading recent notifications...</LoadingState>
        ) : recentNotifications.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <Bell size={48} />
            </EmptyStateIcon>
            <EmptyStateText>
              No notifications sent yet. Send your first notification above!
            </EmptyStateText>
          </EmptyState>
        ) : (
          <NotificationsList>
            {recentNotifications.map((log) => (
              <NotificationLogItem key={log.id}>
                <LogHeader>
                  <LogTitle>{log.title}</LogTitle>
                  <LogActions>
                    <LogTimestamp>
                      <Clock size={12} />
                      {formatTimestamp(log.sentAt)}
                    </LogTimestamp>
                    <DeleteButton
                      onClick={() => handleDeleteLog(log.id)}
                      disabled={deletingLog === log.id}
                    >
                      {deletingLog === log.id ? (
                        <>
                          <Clock size={12} />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={12} />
                          Delete
                        </>
                      )}
                    </DeleteButton>
                  </LogActions>
                </LogHeader>
                <LogBody>{log.body}</LogBody>
                <LogStats>
                  <LogStat $success>
                    <Users size={14} />
                    {log.successCount} delivered
                  </LogStat>
                  {log.failureCount > 0 && (
                    <LogStat>
                      {log.failureCount} failed
                    </LogStat>
                  )}
                  <LogStat>
                    Total: {log.sentTo} users
                  </LogStat>
                </LogStats>
              </NotificationLogItem>
            ))}
          </NotificationsList>
        )}
      </Card>
    </Container>
  );
}
