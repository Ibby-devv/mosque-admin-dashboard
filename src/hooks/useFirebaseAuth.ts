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
}

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<LoginResult> => {
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
    isAuthenticated: !!user
  };
};