import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock register
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard/patient');
    }, 1000);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="h2" style={{ marginBottom: 'var(--space-2)' }}>Create an Account</h1>
        <p className="text-muted">Register to easily book appointments and manage your dental records.</p>
      </div>

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Input 
            label="Full Name" 
            type="text" 
            placeholder="John Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            iconLeft={<User size={18} />}
            required 
          />
        </div>
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
            placeholder="Create a password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconLeft={<Lock size={18} />}
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
          {isLoading ? 'Creating Account...' : 'Register'}
        </Button>
      </form>

      <div style={{ marginTop: 'var(--space-8)', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
          Sign in here
        </Link>
      </div>
    </div>
  );
};
