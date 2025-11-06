import { useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { RoleId, Permission } from '../constants/roles';
import { getPermissionsFromRoles } from '../utils/permissions';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface UseFirebaseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<LoginResult>;
  isAuthenticated: boolean;
  hasAccess: boolean; // Has any roles assigned
  userRoles: RoleId[];
  permissions: Permission[];
  isSuperAdmin: boolean;
  hasLegacyClaims: boolean; // True if using old admin:true format
}

/**
 * Migrate legacy claims to new role system
 */
function migrateLegacyClaims(claims: any): RoleId[] {
  // If user has new roles system, use it
  if (claims.roles && Array.isArray(claims.roles)) {
    return claims.roles as RoleId[];
  }

  // If user has old superAdmin claim, make them Super Admin
  if (claims.superAdmin === true) {
    return [RoleId.SUPER_ADMIN];
  }

  // If user has old admin claim, make them Admin
  if (claims.admin === true) {
    return [RoleId.ADMIN];
  }

  // No roles
  return [];
}

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [userRoles, setUserRoles] = useState<RoleId[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [hasLegacyClaims, setHasLegacyClaims] = useState<boolean>(false);

  // Check authentication state and extract roles/permissions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Get fresh ID token with claims
          const idTokenResult = await currentUser.getIdTokenResult(true);
          const claims = idTokenResult.claims;
          
          console.log('User claims:', claims);

          // Extract roles (with legacy support)
          const roles = migrateLegacyClaims(claims);
          
          // Check if user has legacy claims (admin:true but no roles array)
          const isLegacy = (claims.admin === true || claims.superAdmin === true) && 
                           (!claims.roles || !Array.isArray(claims.roles) || claims.roles.length === 0);
          setHasLegacyClaims(isLegacy);
          
          // Extract permissions (calculate if not in claims)
          let userPermissions: Permission[];
          if (claims.permissions && Array.isArray(claims.permissions)) {
            userPermissions = claims.permissions as Permission[];
          } else {
            // Calculate permissions from roles
            userPermissions = getPermissionsFromRoles(roles);
          }

          // Check if user has any access
          const hasAnyAccess = roles.length > 0 || userPermissions.length > 0;
          
          if (!hasAnyAccess) {
            console.warn('⛔ User has no roles assigned:', currentUser.email);
            await signOut(auth);
            setUser(null);
            setUserRoles([]);
            setPermissions([]);
            setIsSuperAdmin(false);
  setHasLegacyClaims(false);
  setHasLegacyClaims(false);
          setHasLegacyClaims(false);
          setHasLegacyClaims(false);
            setError('Unauthorized: No dashboard access');
            setLoading(false);
            return;
          }
          
          // Set user data
          setUser(currentUser);
          setUserRoles(roles);
          setPermissions(userPermissions);
          setIsSuperAdmin(claims.isSuperAdmin === true || roles.includes(RoleId.SUPER_ADMIN));
          setError('');
        } catch (err) {
          console.error('Error getting user claims:', err);
          setError('Failed to load user permissions');
          await signOut(auth);
          setUser(null);
          setUserRoles([]);
          setPermissions([]);
          setIsSuperAdmin(false);
        }
      } else {
        setUser(null);
        setUserRoles([]);
        setPermissions([]);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<LoginResult> => {
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verify user has access (roles or permissions)
      const idTokenResult = await userCredential.user.getIdTokenResult();
      const claims = idTokenResult.claims;
      const roles = migrateLegacyClaims(claims);
      
      if (roles.length === 0 && !claims.admin) {
        await signOut(auth);
        const errorMessage = 'Unauthorized: No dashboard access assigned';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      
      // User-friendly error messages
      let errorMessage = 'Login failed. Please check your credentials';
      
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async (): Promise<LoginResult> => {
    try {
      await signOut(auth);
      setUserRoles([]);
      setPermissions([]);
      setIsSuperAdmin(false);
      return { success: true };
    } catch (err: any) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasAccess: userRoles.length > 0,
    userRoles,
    permissions,
    isSuperAdmin,
  hasLegacyClaims,
  };
};