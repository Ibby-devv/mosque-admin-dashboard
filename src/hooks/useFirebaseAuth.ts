import { useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

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
  isAdmin: boolean;
}

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check authentication state and admin claim
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check for admin custom claim
        const idTokenResult = await currentUser.getIdTokenResult(true);
        const hasAdminClaim = !!idTokenResult.claims.admin;
        
        console.log('User claims:', idTokenResult.claims);
        
        if (!hasAdminClaim) {
          console.warn('⛔ Non-admin user attempted dashboard access:', currentUser.email);
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
          setError('Unauthorized: Admin access required');
          setLoading(false);
          return;
        }
        
        setUser(currentUser);
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
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
      
      // Verify admin claim immediately after login
      const idTokenResult = await userCredential.user.getIdTokenResult();
      if (!idTokenResult.claims.admin) {
        await signOut(auth);
        const errorMessage = 'Unauthorized: Admin access required';
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
    isAdmin
  };
};