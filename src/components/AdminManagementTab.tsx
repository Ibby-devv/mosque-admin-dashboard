import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Theme } from '../constants/theme';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { UserPlus, UserMinus, Shield, AlertCircle, Mail, Lock, User, Info, Edit2 } from 'lucide-react';
import Loading from './ui/Loading';
import { RoleId, ROLES, getRolesByCategory, PERMISSION_LABELS } from '../constants/roles';
import { getPermissionsFromRoles, isValidRoleCombination } from '../utils/permissions';
import { UserWithRoles } from '../types';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

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

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.lg};
`;

const FormGrid = styled.div`
  display: grid;
  gap: ${Theme.spacing.lg};
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
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

const RoleSelectionSection = styled.div`
  margin-top: ${Theme.spacing.lg};
  padding: ${Theme.spacing.lg};
  background: ${Theme.colors.surface.soft};
  border-radius: ${Theme.radius.md};
`;

const RoleCategory = styled.div`
  margin-bottom: ${Theme.spacing.xl};
  &:last-child {
    margin-bottom: 0;
  }
`;

const AdvancedRolesToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  width: 100%;
  padding: ${Theme.spacing.md};
  background: ${Theme.colors.surface.soft};
  border: 2px dashed ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  color: ${Theme.colors.text.muted};
  font-weight: 500;
  font-size: ${Theme.typography.small};
  cursor: pointer;
  transition: all 0.2s;
  margin-top: ${Theme.spacing.md};

  &:hover {
    border-color: ${Theme.colors.brand.navy[700]};
    color: ${Theme.colors.brand.navy[700]};
    background: ${Theme.colors.surface.card};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const CategoryTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${Theme.colors.text.base};
  margin-bottom: ${Theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  text-transform: capitalize;
`;

const RoleCheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.sm};
`;

const RoleCheckbox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${Theme.spacing.md};
  padding: ${Theme.spacing.md};
  background: white;
  border: 2px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${Theme.colors.brand.navy[700]};
    background: ${Theme.colors.surface.soft};
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
`;

const RoleInfo = styled.div`
  flex: 1;
`;

const RoleName = styled.div`
  font-weight: 600;
  color: ${Theme.colors.text.base};
  margin-bottom: ${Theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
`;

const RoleDescription = styled.div`
  font-size: 0.875rem;
  color: ${Theme.colors.text.muted};
`;

const PermissionsPreview = styled.div`
  margin-top: ${Theme.spacing.lg};
  padding: ${Theme.spacing.lg};
  background: white;
  border: 2px solid ${Theme.colors.brand.navy[600]};
  border-radius: ${Theme.radius.md};
`;

const PreviewTitle = styled.div`
  font-weight: 600;
  color: ${Theme.colors.text.base};
  margin-bottom: ${Theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
`;

const PermissionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${Theme.spacing.sm};
`;

const PermissionItem = styled.div`
  font-size: 0.875rem;
  color: ${Theme.colors.text.muted};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.xs};

  &::before {
    content: '✓';
    color: ${Theme.colors.status.success};
    font-weight: bold;
  }
`;

const Button = styled.button<{ $variant?: 'danger' | 'primary' | 'secondary' }>`
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
    props.$variant === 'danger' 
      ? Theme.colors.status.error 
      : props.$variant === 'secondary'
      ? Theme.colors.surface.muted
      : Theme.colors.brand.navy[700]};
  color: ${(props) => props.$variant === 'secondary' ? Theme.colors.text.base : 'white'};

  &:hover {
    background: ${(props) =>
      props.$variant === 'danger' 
        ? Theme.colors.status.errorDark 
        : props.$variant === 'secondary'
        ? Theme.colors.border.medium
        : Theme.colors.brand.navy[600]};
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

const FormActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.md};
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' | 'info' | 'warning' }>`
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
      : props.type === 'warning'
      ? '#fff3cd'
      : '#d1ecf1'};
  color: ${(props) =>
    props.type === 'success'
      ? '#155724'
      : props.type === 'error'
      ? '#721c24'
      : props.type === 'warning'
      ? '#856404'
      : '#0c5460'};
  border: 1px solid
    ${(props) =>
      props.type === 'success'
        ? '#c3e6cb'
        : props.type === 'error'
        ? '#f5c6cb'
        : props.type === 'warning'
        ? '#ffeaa7'
        : '#bee5eb'};
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
`;

const UserCard = styled.div`
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

const UserInfo = styled.div`
  flex: 1;
`;

const UserEmail = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  margin-bottom: ${Theme.spacing.xs};
  flex-wrap: wrap;
`;

const Email = styled.strong`
  font-size: 1rem;
  color: ${Theme.colors.text.base};
`;

const SecondaryText = styled.div`
  font-size: 0.875rem;
  color: ${Theme.colors.text.muted};
  margin-top: 2px;
`;

const RoleBadge = styled.span<{ $color?: string }>`
  display: inline-block;
  padding: ${Theme.spacing.xs} ${Theme.spacing.sm};
  background: ${props => props.$color || Theme.colors.brand.navy[700]};
  color: white;
  border-radius: ${Theme.radius.sm};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-right: ${Theme.spacing.xs};
`;

const UserMeta = styled.small`
  color: ${Theme.colors.text.muted};
  font-size: 0.875rem;
  display: block;
  margin-top: ${Theme.spacing.xs};
`;

const UserActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${Theme.spacing.xxl};
  color: ${Theme.colors.text.muted};
`;

const InfoBox = styled.div`
  background: ${Theme.colors.accent.blueSoft};
  border-left: 4px solid ${Theme.colors.brand.navy[700]};
  padding: ${Theme.spacing.md};
  border-radius: ${Theme.radius.md};
  margin-bottom: ${Theme.spacing.lg};
  font-size: ${Theme.typography.body};
  color: ${Theme.colors.text.base};
`;

export default function AdminManagementTabNew(): React.JSX.Element {
  const { hasLegacyClaims, isSuperAdmin } = useFirebaseAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'assign' | 'manage'>('create');
  
  // Form fields
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [existingUserEmail, setExistingUserEmail] = useState('');
  
  // Role selection
  const [selectedRoles, setSelectedRoles] = useState<RoleId[]>([]);
  const [showAdvancedRoles, setShowAdvancedRoles] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<{ uid: string; email: string; currentName: string | null } | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  // Helper: format last sign-in timestamp, show "Never" if absent/invalid
  const formatLastSignIn = (ts?: string): string => {
    if (!ts) return 'Never';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return 'Never';
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const listUsersFunc = httpsCallable(functions, 'listUsers');
      const result = await listUsersFunc(showAllUsers ? { includeAll: true } : {});
      setUsers((result.data as any).users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setMessage({
        text: `Failed to load users: ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    // Reload whenever the toggle changes
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllUsers]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectivePermissions = React.useMemo(() => {
    return getPermissionsFromRoles(selectedRoles);
  }, [selectedRoles]);

  const roleValidation = React.useMemo(() => {
    return isValidRoleCombination(selectedRoles);
  }, [selectedRoles]);

  const handleRoleToggle = (roleId: RoleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(r => r !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const createNewUser = async () => {
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

    if (selectedRoles.length === 0) {
      setMessage({ text: 'Please select at least one role', type: 'error' });
      return;
    }

    if (!roleValidation.valid) {
      setMessage({ text: roleValidation.conflicts?.[0] || 'Invalid role combination', type: 'error' });
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
        roles: selectedRoles,
      });

      const data = result.data as any;

      setMessage({
        text: `✅ User created successfully! ${data.resetLink ? 'Password reset link generated.' : ''}`,
        type: 'success',
      });

      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserDisplayName('');
      setSelectedRoles([]);

      await loadUsers();
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

  const assignRolesToExistingUser = async () => {
    if (!existingUserEmail.trim()) {
      setMessage({ text: 'Please enter an email address', type: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(existingUserEmail.trim())) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    if (selectedRoles.length === 0) {
      setMessage({ text: 'Please select at least one role', type: 'error' });
      return;
    }

    if (!roleValidation.valid) {
      setMessage({ text: roleValidation.conflicts?.[0] || 'Invalid role combination', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const setUserRolesFunc = httpsCallable(functions, 'setUserRoles');
      await setUserRolesFunc({
        email: existingUserEmail.trim(),
        roles: selectedRoles,
      });

      setMessage({
        text: `✅ Roles assigned to ${existingUserEmail}`,
        type: 'success',
      });
      setExistingUserEmail('');
      setSelectedRoles([]);
      await loadUsers();
    } catch (error: any) {
      console.error('Error assigning roles:', error);
      let errorMessage = error.message;
      
      if (error.code === 'not-found') {
        errorMessage = `User with email ${existingUserEmail} not found. Please create the account first.`;
      }
      
      setMessage({
        text: `❌ ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeUserRoles = async (uid: string, email: string) => {
    if (!window.confirm(`Remove all roles from ${email}? They will lose dashboard access.`)) return;

    setLoading(true);
    setMessage(null);

    try {
      const removeUserRolesFunc = httpsCallable(functions, 'removeUserRoles');
      await removeUserRolesFunc({ uid });

      setMessage({
        text: `✅ Dashboard access removed for ${email}`,
        type: 'success',
      });
      await loadUsers();
    } catch (error: any) {
      console.error('Error removing roles:', error);
      setMessage({
        text: `❌ ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const makeSuperAdmin = async (uid: string, email: string) => {
    if (!window.confirm(`Grant Super Admin status to ${email}? This gives full system access and cannot be easily revoked.`)) return;

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
      await loadUsers();
    } catch (error: any) {
      console.error('Error setting Super Admin:', error);
      setMessage({
        text: `❌ ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Convenience: jump to Assign-to-Existing with prefilled email
  const startAssignRoles = (email: string) => {
    setExistingUserEmail(email);
    setActiveTab('assign');
    // optional scroll to the assign section
    try {
      document.getElementById('assign-existing-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  };

  const migrateMyAccount = async () => {
    if (!window.confirm('Migrate your account to the new role system? You will need to log out and log back in after migration.')) return;

    setLoading(true);
    setMessage(null);

    try {
      const migrateFunc = httpsCallable(functions, 'migrateMyAccountToNewSystem');
      const result = await migrateFunc();
      const data = result.data as any;

      setMessage({
        text: `✅ ${data.message}. ${data.note || ''}`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('Error migrating account:', error);
      setMessage({
        text: `❌ ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserDisplayName = async () => {
    if (!editingUser) return;

    if (!editDisplayName.trim()) {
      setMessage({ text: 'Display name cannot be empty', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const updateProfileFunc = httpsCallable(functions, 'updateUserProfile');
      await updateProfileFunc({
        uid: editingUser.uid,
        displayName: editDisplayName.trim(),
      });

      setMessage({
        text: `✅ Display name updated for ${editingUser.email}`,
        type: 'success',
      });
      setEditingUser(null);
      setEditDisplayName('');
      await loadUsers();
    } catch (error: any) {
      console.error('Error updating display name:', error);
      setMessage({
        text: `❌ ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUserAccount = async (uid: string, email: string) => {
    if (!window.confirm(`⚠️ PERMANENT DELETE\n\nAre you sure you want to permanently delete ${email}?\n\nThis action CANNOT be undone. The user account will be completely removed from Firebase.`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const deleteUserFunc = httpsCallable(functions, 'deleteUser');
      const result = await deleteUserFunc({ uid });
      const data = result.data as any;

      setMessage({
        text: `✅ ${data.message}`,
        type: 'success',
      });
      await loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setMessage({
        text: `❌ ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const rolesByCategory = getRolesByCategory();
  
  // Define common roles (most frequently used)
  const commonRoleIds: RoleId[] = [
    RoleId.ADMIN,
    RoleId.PRAYER_MANAGER,
    RoleId.EVENTS_MANAGER,
    RoleId.DONATIONS_MANAGER,
    RoleId.NOTIFICATIONS_SENDER
  ];
  
  // Define advanced roles (less frequently used, more granular)
  const advancedRoleIds: RoleId[] = [
    RoleId.PRAYER_VIEWER,
    RoleId.EVENTS_EDITOR,
    RoleId.EVENTS_VIEWER,
    RoleId.CAMPAIGN_MANAGER,
    RoleId.DONATIONS_VIEWER,
    RoleId.NOTIFICATIONS_MANAGER,
    RoleId.REPORT_VIEWER
  ];

  return (
    <Container>
      <PageTitle>User Management</PageTitle>

      {editingUser && (
        <InfoBox style={{ marginBottom: Theme.spacing.xl }}>
          <div style={{ marginBottom: Theme.spacing.md }}>
            <strong>Edit Display Name for {editingUser.email}</strong>
          </div>
          <div style={{ display: 'flex', gap: Theme.spacing.md, alignItems: 'flex-end' }}>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="edit-display-name">Display Name</Label>
              <Input
                id="edit-display-name"
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Enter full name"
                disabled={loading}
              />
            </FormGroup>
            <Button onClick={updateUserDisplayName} disabled={loading || !editDisplayName.trim()}>
              Save
            </Button>
            <Button
              $variant="secondary"
              onClick={() => {
                setEditingUser(null);
                setEditDisplayName('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </InfoBox>
      )}

      {hasLegacyClaims && (
        <InfoBox style={{ marginBottom: Theme.spacing.xl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Legacy Account Detected:</strong> You're using an old admin account format. 
            Migrate to the new role system for full functionality.
          </div>
          <Button onClick={migrateMyAccount} disabled={loading} style={{ marginLeft: Theme.spacing.md }}>
            Migrate My Account
          </Button>
        </InfoBox>
      )}

      <Section>
        <SectionTitle>
          <UserPlus size={24} />
          User Management
        </SectionTitle>

        <TabContainer>
          <TabButton
            $active={activeTab === 'create'}
            onClick={() => setActiveTab('create')}
          >
            Create New User
          </TabButton>
          <TabButton
            $active={activeTab === 'assign'}
            onClick={() => setActiveTab('assign')}
          >
            Assign Roles
          </TabButton>
          <TabButton
            $active={activeTab === 'manage'}
            onClick={() => setActiveTab('manage')}
          >
            Manage Users
          </TabButton>
        </TabContainer>

        {activeTab === 'create' ? (
          <>
            <InfoBox>
              Create a new Firebase user account and assign roles. A password reset link will be generated.
            </InfoBox>

            <Form>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="new-user-email">
                    <Mail size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Email Address
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
                  <Label htmlFor="new-user-name">
                    <User size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Display Name
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

                <FormGroup style={{ gridColumn: '1 / -1' }}>
                  <Label htmlFor="new-user-password">
                    <Lock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Temporary Password
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
              </FormGrid>

              <RoleSelectionSection>
                <PreviewTitle>
                  <Shield size={20} />
                  Select Roles
                </PreviewTitle>

                {!roleValidation.valid && (
                  <Message type="warning">
                    <AlertCircle size={20} />
                    {roleValidation.conflicts?.[0]}
                  </Message>
                )}

                {/* Common Roles Section */}
                {Object.entries(rolesByCategory).map(([category, roles]) => {
                  // Filter to show only common roles
                  const commonRoles = roles.filter(role => commonRoleIds.includes(role.id));
                  
                  if (commonRoles.length === 0) return null;
                  
                  return (
                    <RoleCategory key={`${category}-common`}>
                      <CategoryTitle>
                        {category} Roles
                      </CategoryTitle>
                      <RoleCheckboxGroup>
                        {commonRoles.map((role) => (
                          <RoleCheckbox key={role.id}>
                            <Checkbox
                              checked={selectedRoles.includes(role.id)}
                              onChange={() => handleRoleToggle(role.id)}
                              disabled={loading}
                            />
                            <RoleInfo>
                              <RoleName>
                                <span>{role.icon}</span>
                                {role.name}
                              </RoleName>
                              <RoleDescription>{role.description}</RoleDescription>
                            </RoleInfo>
                          </RoleCheckbox>
                        ))}
                      </RoleCheckboxGroup>
                    </RoleCategory>
                  );
                })}

                {/* Advanced Roles Toggle Button */}
                <AdvancedRolesToggle 
                  type="button"
                  onClick={() => setShowAdvancedRoles(!showAdvancedRoles)}
                >
                  {showAdvancedRoles ? '▲' : '▼'} 
                  {showAdvancedRoles ? 'Hide' : 'Show'} Advanced Roles ({advancedRoleIds.length})
                </AdvancedRolesToggle>

                {/* Advanced Roles Section (Conditionally Rendered) */}
                {showAdvancedRoles && Object.entries(rolesByCategory).map(([category, roles]) => {
                  // Filter to show only advanced roles
                  const advancedRoles = roles.filter(role => advancedRoleIds.includes(role.id));
                  
                  if (advancedRoles.length === 0) return null;
                  
                  return (
                    <RoleCategory key={`${category}-advanced`}>
                      <CategoryTitle>
                        {category} Roles (Advanced)
                      </CategoryTitle>
                      <RoleCheckboxGroup>
                        {advancedRoles.map((role) => (
                          <RoleCheckbox key={role.id}>
                            <Checkbox
                              checked={selectedRoles.includes(role.id)}
                              onChange={() => handleRoleToggle(role.id)}
                              disabled={loading}
                            />
                            <RoleInfo>
                              <RoleName>
                                <span>{role.icon}</span>
                                {role.name}
                              </RoleName>
                              <RoleDescription>{role.description}</RoleDescription>
                            </RoleInfo>
                          </RoleCheckbox>
                        ))}
                      </RoleCheckboxGroup>
                    </RoleCategory>
                  );
                })}

                {effectivePermissions.length > 0 && (
                  <PermissionsPreview>
                    <PreviewTitle>
                      <Info size={20} />
                      Effective Permissions ({effectivePermissions.length})
                    </PreviewTitle>
                    <PermissionsList>
                      {effectivePermissions.map((permission) => (
                        <PermissionItem key={permission}>
                          {PERMISSION_LABELS[permission]}
                        </PermissionItem>
                      ))}
                    </PermissionsList>
                  </PermissionsPreview>
                )}
              </RoleSelectionSection>

              <FormActions>
                <Button
                  $variant="secondary"
                  onClick={() => setSelectedRoles([])}
                  disabled={loading}
                  type="button"
                >
                  Clear Selection
                </Button>
                <Button onClick={createNewUser} disabled={loading}>
                  <UserPlus size={20} />
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </FormActions>
            </Form>
          </>
        ) : activeTab === 'assign' ? (
          <>
            <div id="assign-existing-section" />
            <InfoBox>
              Assign roles to an existing Firebase user. The user account must already exist.
            </InfoBox>

            <Form>
              <FormGroup>
                <Label htmlFor="existing-email">Email Address</Label>
                <Input
                  id="existing-email"
                  type="email"
                  placeholder="existing.user@almadinamasjid.org.au"
                  value={existingUserEmail}
                  onChange={(e) => setExistingUserEmail(e.target.value)}
                  disabled={loading}
                />
              </FormGroup>

              <RoleSelectionSection>
                <PreviewTitle>
                  <Shield size={20} />
                  Select Roles to Assign
                </PreviewTitle>

                {!roleValidation.valid && (
                  <Message type="warning">
                    <AlertCircle size={20} />
                    {roleValidation.conflicts?.[0]}
                  </Message>
                )}

                {/* Common Roles Section */}
                {Object.entries(rolesByCategory).map(([category, roles]) => {
                  // Filter to show only common roles
                  const commonRoles = roles.filter(role => commonRoleIds.includes(role.id));
                  
                  if (commonRoles.length === 0) return null;
                  
                  return (
                    <RoleCategory key={`${category}-common-existing`}>
                      <CategoryTitle>
                        {category} Roles
                      </CategoryTitle>
                      <RoleCheckboxGroup>
                        {commonRoles.map((role) => (
                          <RoleCheckbox key={role.id}>
                            <Checkbox
                              checked={selectedRoles.includes(role.id)}
                              onChange={() => handleRoleToggle(role.id)}
                              disabled={loading}
                            />
                            <RoleInfo>
                              <RoleName>
                                <span>{role.icon}</span>
                                {role.name}
                              </RoleName>
                              <RoleDescription>{role.description}</RoleDescription>
                            </RoleInfo>
                          </RoleCheckbox>
                        ))}
                      </RoleCheckboxGroup>
                    </RoleCategory>
                  );
                })}

                {/* Advanced Roles Toggle Button */}
                <AdvancedRolesToggle 
                  type="button"
                  onClick={() => setShowAdvancedRoles(!showAdvancedRoles)}
                >
                  {showAdvancedRoles ? '▲' : '▼'} 
                  {showAdvancedRoles ? 'Hide' : 'Show'} Advanced Roles ({advancedRoleIds.length})
                </AdvancedRolesToggle>

                {/* Advanced Roles Section (Conditionally Rendered) */}
                {showAdvancedRoles && Object.entries(rolesByCategory).map(([category, roles]) => {
                  // Filter to show only advanced roles
                  const advancedRoles = roles.filter(role => advancedRoleIds.includes(role.id));
                  
                  if (advancedRoles.length === 0) return null;
                  
                  return (
                    <RoleCategory key={`${category}-advanced-existing`}>
                      <CategoryTitle>
                        {category} Roles (Advanced)
                      </CategoryTitle>
                      <RoleCheckboxGroup>
                        {advancedRoles.map((role) => (
                          <RoleCheckbox key={role.id}>
                            <Checkbox
                              checked={selectedRoles.includes(role.id)}
                              onChange={() => handleRoleToggle(role.id)}
                              disabled={loading}
                            />
                            <RoleInfo>
                              <RoleName>
                                <span>{role.icon}</span>
                                {role.name}
                              </RoleName>
                              <RoleDescription>{role.description}</RoleDescription>
                            </RoleInfo>
                          </RoleCheckbox>
                        ))}
                      </RoleCheckboxGroup>
                    </RoleCategory>
                  );
                })}

                {effectivePermissions.length > 0 && (
                  <PermissionsPreview>
                    <PreviewTitle>
                      <Info size={20} />
                      Effective Permissions ({effectivePermissions.length})
                    </PreviewTitle>
                    <PermissionsList>
                      {effectivePermissions.map((permission) => (
                        <PermissionItem key={permission}>
                          {PERMISSION_LABELS[permission]}
                        </PermissionItem>
                      ))}
                    </PermissionsList>
                  </PermissionsPreview>
                )}
              </RoleSelectionSection>

              <FormActions>
                <Button
                  $variant="secondary"
                  onClick={() => setSelectedRoles([])}
                  disabled={loading}
                  type="button"
                >
                  Clear Selection
                </Button>
                <Button onClick={assignRolesToExistingUser} disabled={loading}>
                  <Shield size={20} />
                  {loading ? 'Assigning...' : 'Assign Roles'}
                </Button>
              </FormActions>
            </Form>
          </>
        ) : activeTab === 'manage' ? (
          <>
            <InfoBox>
              View and manage existing users. Edit display names, remove dashboard access, or delete user accounts.
            </InfoBox>

            <div style={{ marginBottom: Theme.spacing.lg }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: Theme.typography.body, fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={showAllUsers}
                  onChange={(e) => setShowAllUsers(e.target.checked)}
                />
                Show all users (including non-dashboard users)
              </label>
            </div>

            {loadingUsers ? (
              <Loading text="Loading users..." />
            ) : users.length === 0 ? (
              <EmptyState>
                <Shield size={48} color={Theme.colors.text.muted} />
                <p>No users found</p>
              </EmptyState>
            ) : (
              <>
                <div style={{ marginBottom: Theme.spacing.md, color: Theme.colors.text.muted, fontSize: Theme.typography.small }}>
                  Showing {users.length} {showAllUsers ? 'user' : 'dashboard user'}{users.length !== 1 ? 's' : ''}
                </div>
                <UserList>
                  {users.map((user) => (
                    <UserCard key={user.uid}>
                      <UserInfo>
                        <UserEmail>
                          <Shield size={20} color={Theme.colors.brand.navy[700]} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Email>{user.displayName || user.email}</Email>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingUser({ uid: user.uid, email: user.email, currentName: user.displayName });
                                  setEditDisplayName(user.displayName || '');
                                  setTimeout(() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }, 100);
                                }}
                                disabled={loading}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: loading ? 'not-allowed' : 'pointer',
                                  padding: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  opacity: loading ? 0.5 : 1,
                                }}
                                title="Edit display name"
                              >
                                <Edit2 size={14} color={Theme.colors.text.muted} />
                              </button>
                            </div>
                            {user.displayName && (
                              <SecondaryText>{user.email}</SecondaryText>
                            )}
                          </div>
                        </UserEmail>
                        <div>
                          {user.roles.map((roleId) => {
                            const role = ROLES[roleId];
                            return (
                              <RoleBadge key={roleId} $color={role?.color}>
                                {role?.icon} {role?.name || roleId}
                              </RoleBadge>
                            );
                          })}
                          {user.roles.length === 0 && (
                            <RoleBadge $color={Theme.colors.text.muted}>No Dashboard Access</RoleBadge>
                          )}
                        </div>
                        <UserMeta>
                          {user.permissions.length} permissions • Last sign in: {formatLastSignIn(user.lastSignIn)}
                        </UserMeta>
                      </UserInfo>
                      <UserActions>
                        {isSuperAdmin && !user.isSuperAdmin && user.roles.length > 0 && (
                          <Button
                            $variant="secondary"
                            onClick={() => makeSuperAdmin(user.uid, user.email)}
                            disabled={loading}
                            style={{ fontSize: '0.875rem', padding: '8px 12px', minHeight: '36px' }}
                            title="Grant Super Admin status"
                          >
                            <Shield size={16} />
                            Make Super Admin
                          </Button>
                        )}
                        {!user.isSuperAdmin && user.roles.length > 0 && (
                          <Button
                            $variant="secondary"
                            onClick={() => removeUserRoles(user.uid, user.email)}
                            disabled={loading}
                            style={{ fontSize: '0.875rem', padding: '8px 12px', minHeight: '36px' }}
                            title="Remove dashboard access"
                          >
                            <UserMinus size={16} />
                            Remove Access
                          </Button>
                        )}
                        {!user.isSuperAdmin && user.roles.length === 0 && (
                          <Button 
                            onClick={() => startAssignRoles(user.email)} 
                            disabled={loading}
                            style={{ fontSize: '0.875rem', padding: '8px 12px', minHeight: '36px' }}
                          >
                            Assign Roles
                          </Button>
                        )}
                        {isSuperAdmin && !user.isSuperAdmin && (
                          <Button
                            onClick={() => deleteUserAccount(user.uid, user.email)}
                            disabled={loading}
                            style={{
                              fontSize: '0.875rem',
                              padding: '8px 12px',
                              minHeight: '36px',
                              background: 'transparent',
                              color: '#dc2626',
                              border: '1px solid #dc2626',
                            }}
                            title="Permanently delete this user account"
                          >
                            Delete
                          </Button>
                        )}
                        {user.isSuperAdmin && (
                          <RoleBadge $color="#dc2626">🔰 Protected</RoleBadge>
                        )}
                      </UserActions>
                    </UserCard>
                  ))}
                </UserList>
              </>
            )}
          </>
        ) : null}

        {message && (
          <Message type={message.type}>
            <AlertCircle size={20} />
            {message.text}
          </Message>
        )}
      </Section>
    </Container>
  );
}
