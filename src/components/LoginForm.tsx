import React, { useState } from 'react';
import styled from 'styled-components';
import { Settings } from 'lucide-react';
import { LoginFormProps } from '../types';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #1e3a8a, #1e40af);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const IconCircle = styled.div`
  background: #1e3a8a;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
`;

const LoginTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const LoginSubtitle = styled.p`
  color: #4b5563;
  margin: 0;
`;

const FormGroup = styled.div<{ marginBottom?: string }>`
  margin-bottom: ${props => props.marginBottom || '1rem'};
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  border-radius: 0.5rem;
  font-size: 0.875rem;
`;

const Button = styled.button`
  width: 100%;
  background: #1e3a8a;
  color: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #1e40af;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const DemoNotice = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: #1e40af;
`;

export default function LoginForm({ onLogin, error: authError }: LoginFormProps): React.JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <IconCircle>
            <Settings color="white" size={32} />
          </IconCircle>
          <LoginTitle>Admin Dashboard</LoginTitle>
          <LoginSubtitle>Al Madina Masjid Yagoona</LoginSubtitle>
        </LoginHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@almadinamasjid.com.au"
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup marginBottom="1.5rem">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              required
            />
          </FormGroup>

          {authError && <ErrorMessage>{authError}</ErrorMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <DemoNotice>
          <strong>Note:</strong> Use the admin email and password you created in Firebase Authentication.
        </DemoNotice>
      </LoginCard>
    </LoginContainer>
  );
}