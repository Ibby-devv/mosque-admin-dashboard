// ============================================================================
// ADMIN COMPONENT: Notifications Tab (Enhanced with Delete)
// Location: mosque-admin-dashboard/src/components/NotificationsTab.tsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Bell, CheckCircle, AlertCircle, Clock, Users, Trash2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Card from './ui/Card';
import ImageUpload from './ImageUpload';
import { Theme, media } from '../constants/theme';

// ============================================================================
// TYPES
// ============================================================================

interface NotificationFormData {
  title: string;
  body: string;
  image_url?: string;
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

const Container = Card;

const CardTitle = styled.h2`
  font-size: ${Theme.typography.h2};
  font-weight: 700;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.sm};

  ${media.sm} { font-size: ${Theme.typography.h1}; }
`;

const CardDescription = styled.p`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.muted};
  margin: 0 0 ${Theme.spacing.xl} 0;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.lg};
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: ${Theme.typography.small};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.sm};
`;

const CharacterCount = styled.span<{ $isNearLimit: boolean; $isOverLimit: boolean }>`
  font-size: ${Theme.typography.small};
  color: ${props => 
    props.$isOverLimit ? Theme.colors.status.error : 
    props.$isNearLimit ? Theme.colors.status.warning : 
    Theme.colors.text.muted
  };
  font-weight: ${props => (props.$isOverLimit || props.$isNearLimit) ? 600 : 400};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${Theme.spacing.md};
  min-height: 44px;
  border: 1px solid ${props => props.$hasError ? Theme.colors.status.error : Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${props => props.$hasError ? Theme.colors.status.error : Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? Theme.colors.status.errorLight : Theme.colors.accent.blueSoft};
  }

  &::placeholder {
    color: ${Theme.colors.text.subtle};
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${Theme.spacing.md};
  min-height: 44px;
  border: 1px solid ${props => props.$hasError ? Theme.colors.status.error : Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  background: ${Theme.colors.surface.card};
  cursor: pointer;

  &:focus {
    border-color: ${props => props.$hasError ? Theme.colors.status.error : Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? Theme.colors.status.errorLight : Theme.colors.accent.blueSoft};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${Theme.spacing.md};
  min-height: 120px;
  border: 1px solid ${props => props.$hasError ? Theme.colors.status.error : Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: ${props => props.$hasError ? Theme.colors.status.error : Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? Theme.colors.status.errorLight : Theme.colors.accent.blueSoft};
  }

  &::placeholder {
    color: ${Theme.colors.text.subtle};
  }
`;

const ErrorMessage = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.status.error};
  margin-top: ${Theme.spacing.xs};
`;

const HelpText = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.muted};
  margin-top: ${Theme.spacing.xs};
`;

const PreviewCard = styled.div`
  background: ${Theme.colors.surface.soft};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  margin-top: ${Theme.spacing.lg};
`;

const PreviewTitle = styled.div`
  font-size: ${Theme.typography.small};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
`;

const NotificationPreview = styled.div`
  background: ${Theme.colors.surface.card};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  box-shadow: ${Theme.shadow.soft};
`;

const PreviewNotificationTitle = styled.div`
  font-size: ${Theme.typography.body};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.sm};
`;

const PreviewNotificationBody = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.muted};
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${Theme.spacing.lg};
  margin-top: ${Theme.spacing.xl};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 48px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  font-size: ${Theme.typography.body};

  background: ${props => props.$variant === 'secondary' ? Theme.colors.surface.muted : Theme.colors.brand.navy[700]};
  color: ${props => props.$variant === 'secondary' ? Theme.colors.text.strong : 'white'};

  &:hover {
    background: ${props => props.$variant === 'secondary' ? Theme.colors.surface.base : Theme.colors.brand.navy[600]};
    box-shadow: ${Theme.shadow.soft};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${Theme.colors.border.medium};
    color: white;
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

const WarningBox = styled.div`
  background: ${Theme.colors.accent.amberSoft};
  border: 1px solid ${Theme.colors.accent.amber};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  margin-top: ${Theme.spacing.lg};
  display: flex;
  align-items: flex-start;
  gap: ${Theme.spacing.md};
`;

const WarningIcon = styled.div`
  color: ${Theme.colors.accent.amber};
  flex-shrink: 0;
`;

const WarningText = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.strong};
`;

const SuccessBox = styled.div`
  background: ${Theme.colors.status.successLight};
  border: 1px solid ${Theme.colors.status.success};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  margin-bottom: ${Theme.spacing.xl};
  display: flex;
  align-items: flex-start;
  gap: ${Theme.spacing.md};
`;

const SuccessIcon = styled.div`
  color: ${Theme.colors.status.success};
  flex-shrink: 0;
`;

const SuccessContent = styled.div`
  flex: 1;
`;

const SuccessTitle = styled.div`
  font-size: ${Theme.typography.small};
  font-weight: 600;
  color: ${Theme.colors.status.successDark};
  margin-bottom: ${Theme.spacing.xs};
`;

const SuccessText = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.status.success};
`;

const ErrorBox = styled.div`
  background: ${Theme.colors.status.errorLight};
  border: 1px solid ${Theme.colors.status.error};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  margin-bottom: ${Theme.spacing.xl};
  display: flex;
  align-items: flex-start;
  gap: ${Theme.spacing.md};
`;

const ErrorIcon = styled.div`
  color: ${Theme.colors.status.error};
  flex-shrink: 0;
`;

const ErrorContent = styled.div`
  flex: 1;
`;

const ErrorTitle = styled.div`
  font-size: ${Theme.typography.small};
  font-weight: 600;
  color: ${Theme.colors.status.errorDark};
  margin-bottom: ${Theme.spacing.xs};
`;

const ErrorText = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.status.error};
`;

const RecentNotificationsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${Theme.spacing.lg};
`;

const RecentNotificationsTitle = styled.h3`
  font-size: ${Theme.typography.h3};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin: 0;
`;

const DeleteAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.sm} ${Theme.spacing.lg};
  min-height: 44px;
  background: ${Theme.colors.status.errorLight};
  color: ${Theme.colors.status.errorDark};
  border: 1px solid ${Theme.colors.status.error};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.small};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${Theme.colors.status.error};
    color: white;
    box-shadow: ${Theme.shadow.soft};
  }

  &:disabled {
    background: ${Theme.colors.surface.muted};
    color: ${Theme.colors.text.subtle};
    border-color: ${Theme.colors.border.base};
    cursor: not-allowed;
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
`;

const NotificationLogItem = styled.div`
  border: 1px solid ${Theme.colors.border.base};
  border-left: 4px solid ${Theme.colors.accent.blue};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  background: ${Theme.colors.surface.card};
  position: relative;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${Theme.spacing.sm};
`;

const LogTitle = styled.div`
  font-size: ${Theme.typography.body};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  flex: 1;
  padding-right: ${Theme.spacing.lg};
`;

const LogActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
`;

const LogTimestamp = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.muted};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
  padding: ${Theme.spacing.xs} ${Theme.spacing.sm};
  min-height: 32px;
  background: ${Theme.colors.status.errorLight};
  color: ${Theme.colors.status.errorDark};
  border: 1px solid ${Theme.colors.status.error};
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${Theme.colors.status.error};
    color: white;
  }

  &:disabled {
    background: ${Theme.colors.surface.muted};
    color: ${Theme.colors.text.subtle};
    border-color: ${Theme.colors.border.base};
    cursor: not-allowed;
  }
`;

const LogBody = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.muted};
  margin-bottom: ${Theme.spacing.md};
`;

const LogStats = styled.div`
  display: flex;
  gap: ${Theme.spacing.lg};
  font-size: ${Theme.typography.small};
`;

const LogStat = styled.div<{ $success?: boolean }>`
  color: ${props => props.$success ? Theme.colors.status.success : Theme.colors.text.muted};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${Theme.spacing.xxl} ${Theme.spacing.lg};
  color: ${Theme.colors.text.muted};
`;

const EmptyStateIcon = styled.div`
  margin-bottom: ${Theme.spacing.lg};
  color: ${Theme.colors.border.medium};
`;

const EmptyStateText = styled.div`
  font-size: ${Theme.typography.small};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${Theme.spacing.xxl};
  color: ${Theme.colors.text.muted};
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
    image_url: '',
    data: {
      type: 'general',
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

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        type,
      },
    }));

    // Clear send result
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
        image_url: formData.image_url,
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
        image_url: '',
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
      image_url: '',
      data: { type: 'general' },
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
          {/* Notification Type Field */}
          <FormGroup>
            <Label>Notification Type *</Label>
            <Select
              value={formData.data?.type || 'general'}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="general">📢 General Announcement</option>
              <option value="prayer">🕌 Prayer Times</option>
              <option value="event">🎉 Event</option>
              <option value="campaign">💚 Donation Campaign</option>
              <option value="urgent">⚠️ Urgent Alert</option>
            </Select>
            <HelpText>
              Choose the notification type. This determines the color and styling in the mobile app.
            </HelpText>
          </FormGroup>

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

          {/* Image Upload */}
          <FormGroup>
            <Label>Notification Image (Optional)</Label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              onImageDelete={() => setFormData(prev => ({ ...prev, image_url: '' }))}
              storagePath={`notifications/${Date.now()}`}
              disabled={sending}
            />
            <HelpText>
              Add an image to display in the notification. Images will show as Big Picture when users expand the notification.
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
