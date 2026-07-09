import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      showToast('Password reset link sent successfully.', 'success');
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', 
          backgroundColor: 'var(--color-primary-light)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-4)' 
        }}>
          <CheckCircle size={32} color="var(--color-primary)" />
        </div>
        <h2 className="h3" style={{ marginBottom: 'var(--space-2)' }}>Check your email</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
          We've sent a password reset link to <br/><strong>{email}</strong>.
        </p>
        <Link to="/login">
          <Button variant="primary" fullWidth>Return to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="h2" style={{ marginBottom: 'var(--space-2)' }}>Reset Password</h1>
        <p className="text-muted">Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            iconLeft={<Mail size={18} />}
            required 
          />
        </div>
        
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div style={{ marginTop: 'var(--space-8)', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        Remember your password?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
          Sign in here
        </Link>
      </div>
    </div>
  );
};
