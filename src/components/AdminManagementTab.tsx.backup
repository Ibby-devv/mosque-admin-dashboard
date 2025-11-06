import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Theme } from '../constants/theme';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { UserPlus, UserMinus, Shield, AlertCircle, Mail, Lock, User } from 'lucide-react';
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

const TabContainer = styled.div`
  display: flex;
  gap: ${Theme.spacing.md};
  border-bottom: 2px solid ${Theme.colors.border.base};
  margin-bottom: ${Theme.spacing.xl};
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? Theme.colors.brand.navy[700] : 'transparent'};
  color: ${props => props.$active ? Theme.colors.brand.navy[700] : Theme.colors.text.muted};
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;

  &:hover {
    color: ${Theme.colors.brand.navy[700]};
  }
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

const AdminActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
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

const FormGrid = styled.div`
  display: grid;
  gap: ${Theme.spacing.lg};
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  grid-column: 1 / -1;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: ${Theme.typography.body};
  color: ${Theme.colors.text.base};
  cursor: pointer;
  user-select: none;
`;

const InfoBox = styled.div`
  background: ${Theme.colors.accent.blueSoft};
  border-left: 4px solid ${Theme.colors.brand.navy[700]};
  padding: ${Theme.spacing.md};
  border-radius: ${Theme.radius.md};
  margin-top: ${Theme.spacing.lg};
  margin-bottom: ${Theme.spacing.lg};
  font-size: ${Theme.typography.body};
  color: ${Theme.colors.text.base};
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

interface Admin {
  uid: string;
  email: string;
  displayName: string | null;
  role: string;
  superAdmin?: boolean;
  createdAt: string;
  lastSignIn: string;
}

export default function AdminManagementTab(): React.JSX.Element {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'promote'>('create');
  
  // Form fields for creating new user
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [makeAdmin, setMakeAdmin] = useState(true);
  
  // Form field for promoting existing user
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

  const createNewUser = async () => {
    // Validation
    if (!newUserEmail.trim()) {
      setMessage({ text: 'Please enter an email address', type: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail.trim())) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    if (!newUserPassword || newUserPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    if (!newUserDisplayName.trim()) {
      setMessage({ text: 'Please enter a display name', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const createUserFunc = httpsCallable(functions, 'createUserAccount');
      const result = await createUserFunc({
        email: newUserEmail.trim(),
        password: newUserPassword,
        displayName: newUserDisplayName.trim(),
        isAdmin: makeAdmin,
        role: makeAdmin ? 'admin' : 'user',
      });

      const data = result.data as any;

      setMessage({
        text: `✅ User created successfully! ${data.resetLink ? 'Password reset link generated.' : ''}`,
        type: 'success',
      });

      // Clear form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserDisplayName('');
      setMakeAdmin(true);

      // Reload admins list if we created an admin
      if (makeAdmin) {
        await loadAdmins();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      setMessage({
        text: `❌ ${error.message}`,
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

  const setSuperAdminProtection = async (uid: string, email: string) => {
    if (!window.confirm(`Set super admin protection for ${email}? This will make the account permanent and unable to be deleted.`)) return;

    setLoading(true);
    setMessage(null);

    try {
      const setSuperAdminFunc = httpsCallable(functions, 'setSuperAdminProtection');
      const result = await setSuperAdminFunc({ uid });
      const data = result.data as any;

      setMessage({
        text: `✅ ${data.message}`,
        type: 'success',
      });
      await loadAdmins();
    } catch (error: any) {
      console.error('Error setting super admin protection:', error);
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

      <Section>
        <SectionTitle>
          <UserPlus size={24} />
          Add New Admin
        </SectionTitle>

        <TabContainer>
          <TabButton
            $active={activeTab === 'create'}
            onClick={() => setActiveTab('create')}
          >
            Create New User
          </TabButton>
          <TabButton
            $active={activeTab === 'promote'}
            onClick={() => setActiveTab('promote')}
          >
            Promote Existing User
          </TabButton>
        </TabContainer>

        {activeTab === 'create' ? (
          <>
            <InfoBox>
              Create a new Firebase user account and optionally grant admin access immediately.
              A password reset link will be generated for the user to set their own password.
            </InfoBox>

            <Form>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="new-user-email">
                    <Mail size={16} /> Email Address
                  </Label>
                  <Input
                    id="new-user-email"
                    type="email"
                    placeholder="user@almadinamasjid.org.au"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="new-user-password">
                    <Lock size={16} /> Temporary Password
                  </Label>
                  <Input
                    id="new-user-password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="new-user-name">
                    <User size={16} /> Display Name
                  </Label>
                  <Input
                    id="new-user-name"
                    type="text"
                    placeholder="Full Name"
                    value={newUserDisplayName}
                    onChange={(e) => setNewUserDisplayName(e.target.value)}
                    disabled={loading}
                  />
                </FormGroup>
              </FormGrid>

              <CheckboxGroup>
                <Checkbox
                  id="make-admin"
                  type="checkbox"
                  checked={makeAdmin}
                  onChange={(e) => setMakeAdmin(e.target.checked)}
                  disabled={loading}
                />
                <CheckboxLabel htmlFor="make-admin">
                  <Shield size={16} style={{ verticalAlign: 'middle' }} /> Grant admin access
                  immediately
                </CheckboxLabel>
              </CheckboxGroup>

              <FormRow>
                <Button onClick={createNewUser} disabled={loading}>
                  <UserPlus size={20} />
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </FormRow>
            </Form>
          </>
        ) : (
          <>
            <InfoBox>
              Grant admin access to an existing Firebase user. The user account must already exist
              in Firebase Authentication.
            </InfoBox>

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
          </>
        )}

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
                <AdminActions>
                  {!admin.superAdmin && (
                    <Button
                      onClick={() => setSuperAdminProtection(admin.uid, admin.email)}
                      disabled={loading}
                    >
                      <Shield size={20} />
                      Make Permanent
                    </Button>
                  )}
                  <Button
                    $variant="danger"
                    onClick={() => removeAdminRole(admin.uid, admin.email)}
                    disabled={loading}
                  >
                    <UserMinus size={20} />
                    Remove Access
                  </Button>
                </AdminActions>
              </AdminCard>
            ))}
          </AdminList>
        )}
      </Section>
    </Container>
  );
}
