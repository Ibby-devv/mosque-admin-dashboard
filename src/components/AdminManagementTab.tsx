import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Theme } from '../constants/theme';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { UserPlus, UserMinus, Shield, AlertCircle } from 'lucide-react';
import Loading from './ui/Loading';

const Container = styled.div`
  padding: ${Theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: ${Theme.colors.text.base};
  margin-bottom: ${Theme.spacing.lg};
`;

const Section = styled.div`
  background: ${Theme.colors.surface.card};
  border-radius: ${Theme.radius.lg};
  padding: ${Theme.spacing.xl};
  margin-bottom: ${Theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${Theme.colors.text.base};
  margin-bottom: ${Theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
`;

const AdminList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
`;

const AdminCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${Theme.spacing.lg};
  background: ${Theme.colors.surface.muted};
  border-radius: ${Theme.radius.md};
  border: 1px solid ${Theme.colors.border.base};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${Theme.spacing.md};
  }
`;

const AdminInfo = styled.div`
  flex: 1;
`;

const AdminEmail = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  margin-bottom: ${Theme.spacing.xs};
`;

const Email = styled.strong`
  font-size: 1rem;
  color: ${Theme.colors.text.base};
`;

const AdminMeta = styled.small`
  color: ${Theme.colors.text.muted};
  font-size: 0.875rem;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: ${Theme.spacing.xs} ${Theme.spacing.sm};
  background: ${Theme.colors.brand.navy[700]};
  color: white;
  border-radius: ${Theme.radius.sm};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: ${Theme.spacing.sm};
`;

const Button = styled.button<{ $variant?: 'danger' | 'primary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 48px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  font-size: ${Theme.typography.body};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.$variant === 'danger' ? Theme.colors.status.error : Theme.colors.brand.navy[700]};
  color: white;

  &:hover {
    background: ${(props) =>
      props.$variant === 'danger' ? Theme.colors.status.errorDark : Theme.colors.brand.navy[600]};
    transform: translateY(-1px);
    box-shadow: ${Theme.shadow.soft};
  }

  &:disabled {
    background: ${Theme.colors.border.medium};
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.lg};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${Theme.spacing.md};
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: ${Theme.typography.body};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  min-height: 44px;
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }

  &:disabled {
    background: ${Theme.colors.surface.muted};
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: ${Theme.spacing.md};
  border-radius: ${Theme.radius.md};
  margin-top: ${Theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  background: ${(props) =>
    props.type === 'success'
      ? '#d4edda'
      : props.type === 'error'
      ? '#f8d7da'
      : '#d1ecf1'};
  color: ${(props) =>
    props.type === 'success'
      ? '#155724'
      : props.type === 'error'
      ? '#721c24'
      : '#0c5460'};
  border: 1px solid
    ${(props) =>
      props.type === 'success'
        ? '#c3e6cb'
        : props.type === 'error'
        ? '#f5c6cb'
        : '#bee5eb'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${Theme.spacing.xxl};
  color: ${Theme.colors.text.muted};
`;

const Instructions = styled.div`
  background: ${Theme.colors.surface.muted};
  border-left: 4px solid ${Theme.colors.brand.navy[700]};
  padding: ${Theme.spacing.lg};
  border-radius: ${Theme.radius.md};
  margin-bottom: ${Theme.spacing.lg};
`;

const InstructionStep = styled.p`
  margin: ${Theme.spacing.sm} 0;
  color: ${Theme.colors.text.muted};
  font-size: 0.9rem;
`;

interface Admin {
  uid: string;
  email: string;
  displayName: string | null;
  role: string;
  createdAt: string;
  lastSignIn: string;
}

export default function AdminManagementTab(): React.JSX.Element {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const listAdminsFunc = httpsCallable(functions, 'listAdmins');
      const result = await listAdminsFunc();
      setAdmins((result.data as any).admins || []);
    } catch (error: any) {
      console.error('Error loading admins:', error);
      setMessage({
        text: `Failed to load admins: ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      setMessage({ text: 'Please enter an email address', type: 'error' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail.trim())) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const setUserRoleFunc = httpsCallable(functions, 'setUserRole');
      await setUserRoleFunc({
        email: newAdminEmail.trim(),
        isAdmin: true,
        role: 'admin',
      });

      setMessage({
        text: `✅ Admin access granted to ${newAdminEmail}`,
        type: 'success',
      });
      setNewAdminEmail('');
      await loadAdmins();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      let errorMessage = error.message;
      
      if (error.code === 'not-found') {
        errorMessage = `User with email ${newAdminEmail} not found. Please create the account in Firebase Console first.`;
      }
      
      setMessage({
        text: `❌ ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeAdminRole = async (uid: string, email: string) => {
    if (!window.confirm(`Remove admin access for ${email}?`)) return;

    setLoading(true);
    setMessage(null);

    try {
      const removeAdminFunc = httpsCallable(functions, 'removeAdmin');
      await removeAdminFunc({ uid });

      setMessage({
        text: `✅ Admin access removed from ${email}`,
        type: 'success',
      });
      await loadAdmins();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      setMessage({
        text: `❌ ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addAdmin();
    }
  };

  return (
    <Container>
      <PageTitle>Admin Management</PageTitle>

      <Instructions>
        <strong>Note:</strong>
        <InstructionStep>
          • To add a new admin, the user account must first exist in Firebase Authentication
        </InstructionStep>
        <InstructionStep>
          • Create accounts at: Firebase Console → Authentication → Users → Add User
        </InstructionStep>
        <InstructionStep>
          • Then use the form below to grant admin access
        </InstructionStep>
      </Instructions>

      <Section>
        <SectionTitle>
          <UserPlus size={24} />
          Add New Admin
        </SectionTitle>
        <Form>
          <FormRow>
            <FormGroup>
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@almadinamasjid.org.au"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </FormGroup>
            <Button onClick={addAdmin} disabled={loading}>
              <UserPlus size={20} />
              {loading ? 'Adding...' : 'Add Admin'}
            </Button>
          </FormRow>
        </Form>
        {message && (
          <Message type={message.type}>
            <AlertCircle size={20} />
            {message.text}
          </Message>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <Shield size={24} />
          Current Admins ({admins.length})
        </SectionTitle>

        {loadingAdmins ? (
          <Loading text="Loading admins..." />
        ) : admins.length === 0 ? (
          <EmptyState>
            <Shield size={48} color={Theme.colors.text.muted} />
            <p>No admins found</p>
          </EmptyState>
        ) : (
          <AdminList>
            {admins.map((admin) => (
              <AdminCard key={admin.uid}>
                <AdminInfo>
                  <AdminEmail>
                    <Shield size={20} color={Theme.colors.brand.navy[700]} />
                    <Email>{admin.email}</Email>
                    <RoleBadge>{admin.role}</RoleBadge>
                  </AdminEmail>
                  <AdminMeta>
                    Last sign in: {new Date(admin.lastSignIn).toLocaleDateString()} at{' '}
                    {new Date(admin.lastSignIn).toLocaleTimeString()}
                  </AdminMeta>
                </AdminInfo>
                <Button
                  $variant="danger"
                  onClick={() => removeAdminRole(admin.uid, admin.email)}
                  disabled={loading}
                >
                  <UserMinus size={20} />
                  Remove Access
                </Button>
              </AdminCard>
            ))}
          </AdminList>
        )}
      </Section>
    </Container>
  );
}
