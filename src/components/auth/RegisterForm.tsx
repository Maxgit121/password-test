import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, UserPlus } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { checkPasswordStrength } from '../../utils/passwordStrength';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    username?: string; 
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const validate = (): boolean => {
    const newErrors: { 
      username?: string; 
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const strength = checkPasswordStrength(password);
      if (strength.score < 2) {
        newErrors.password = `Password is too weak: ${strength.feedback.warning || 'Please choose a stronger password'}`;
      }
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const success = await register(username, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Password strength indicator
  const renderPasswordStrength = () => {
    if (!password) return null;
    
    const { score, label, color } = checkPasswordStrength(password);
    
    return (
      <div className="mt-1">
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${(score + 1) * 20}%`,
              backgroundColor: color
            }}
          ></div>
        </div>
        <p className="text-xs mt-1" style={{ color }}>
          Password strength: {label}
        </p>
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            id="username"
            type="text"
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            fullWidth
            leftIcon={<User size={18} />}
            size="lg"
            autoComplete="username"
          />
        </div>
        
        <div>
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            fullWidth
            leftIcon={<Lock size={18} />}
            showPasswordToggle
            size="lg"
            autoComplete="new-password"
          />
          {renderPasswordStrength()}
        </div>
        
        <div>
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            fullWidth
            leftIcon={<Lock size={18} />}
            showPasswordToggle
            size="lg"
            autoComplete="new-password"
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          icon={<UserPlus size={18} />}
        >
          Register
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm;