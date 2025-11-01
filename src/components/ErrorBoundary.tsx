import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Theme } from '../constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${Theme.spacing.xl};
  background: ${Theme.colors.surface.muted};
`;

const ErrorCard = styled.div`
  background: white;
  border-radius: ${Theme.radius.lg};
  padding: ${Theme.spacing.xxl};
  max-width: 600px;
  width: 100%;
  box-shadow: ${Theme.shadow.card};
  text-align: center;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${Theme.spacing.xl};
  
  svg {
    color: ${Theme.colors.status.error};
    width: 64px;
    height: 64px;
  }
`;

const ErrorTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${Theme.colors.text.base};
  margin: 0 0 ${Theme.spacing.md} 0;
`;

const ErrorMessage = styled.p`
  color: ${Theme.colors.text.muted};
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 ${Theme.spacing.xl} 0;
`;

const ErrorDetails = styled.details`
  text-align: left;
  background: ${Theme.colors.surface.muted};
  padding: ${Theme.spacing.md};
  border-radius: ${Theme.radius.md};
  margin-bottom: ${Theme.spacing.xl};
  font-size: 13px;
  color: ${Theme.colors.text.muted};
  
  summary {
    cursor: pointer;
    font-weight: 600;
    color: ${Theme.colors.text.base};
    margin-bottom: ${Theme.spacing.sm};
    
    &:hover {
      color: ${Theme.colors.brand.navy[600]};
    }
  }
  
  pre {
    margin: ${Theme.spacing.sm} 0 0 0;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${Theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  border-radius: ${Theme.radius.md};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const PrimaryButton = styled(Button)`
  background: ${Theme.colors.brand.navy[700]};
  color: white;
  
  &:hover {
    background: ${Theme.colors.brand.navy[800]};
  }
`;

const SecondaryButton = styled(Button)`
  background: ${Theme.colors.surface.muted};
  color: ${Theme.colors.text.base};
  border: 1px solid ${Theme.colors.border.base};
  
  &:hover {
    background: ${Theme.colors.surface.soft};
  }
`;

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service (e.g., Sentry) in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error tracking service integration
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorCard>
            <IconWrapper>
              <AlertTriangle />
            </IconWrapper>
            
            <ErrorTitle>Oops! Something went wrong</ErrorTitle>
            
            <ErrorMessage>
              We're sorry, but something unexpected happened. The error has been logged 
              and we'll look into it. Please try refreshing the page or going back to the home page.
            </ErrorMessage>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <ErrorDetails>
                <summary>Error Details (Development Only)</summary>
                <pre>
                  <strong>Error:</strong> {this.state.error.toString()}
                  {'\n\n'}
                  <strong>Stack Trace:</strong> {this.state.error.stack}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </ErrorDetails>
            )}

            <ButtonGroup>
              <PrimaryButton onClick={this.handleReload}>
                <RefreshCw size={18} />
                Reload Page
              </PrimaryButton>
              <SecondaryButton onClick={this.handleGoHome}>
                Go to Home
              </SecondaryButton>
            </ButtonGroup>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
