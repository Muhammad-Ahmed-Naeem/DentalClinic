import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock login based on email
    setTimeout(() => {
      setIsLoading(false);
      if (email.includes('admin')) {
        navigate('/dashboard/admin');
      } else if (email.includes('dentist')) {
        navigate('/dashboard/dentist');
      } else if (email.includes('receptionist')) {
        navigate('/dashboard/receptionist');
      } else if (email.includes('owner')) {
        navigate('/dashboard/owner');
      } else {
        navigate('/dashboard/patient');
      }
    }, 1000);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="h2" style={{ marginBottom: 'var(--space-2)' }}>Welcome Back</h1>
        <p className="text-muted">Sign in to your account to manage your appointments and records.</p>
      </div>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
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
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconLeft={<Lock size={18} />}
            required 
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
              Forgot Password?
            </Link>
          </div>
        </div>
        
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div style={{ marginTop: 'var(--space-8)', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
          Register here
        </Link>
      </div>
      
      <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
        <strong>Mock Login Tips:</strong> Use emails containing <br/>
        <code>patient@</code>, <code>dentist@</code>, <code>admin@</code>, <code>receptionist@</code>, <code>owner@</code> <br/>
        to access different dashboards.
      </div>
    </div>
  );
};
