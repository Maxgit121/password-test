import React, { useState, useEffect } from 'react';
import { Lock, User, Globe, FileText, Tag, RefreshCw, Plus, Save, Trash } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Password } from '../../types';
import { usePasswords } from '../../context/PasswordContext';
import { checkPasswordStrength, generatePassword } from '../../utils/passwordStrength';

interface PasswordFormProps {
  initialData?: Password;
  onClose: () => void;
  isEditing?: boolean;
}

const CATEGORIES = [
  'Personal',
  'Work',
  'Finance',
  'Social',
  'Shopping',
  'Travel',
  'Entertainment',
  'Other'
];

const PasswordForm: React.FC<PasswordFormProps> = ({ 
  initialData, 
  onClose, 
  isEditing = false 
}) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Personal');
  const [errors, setErrors] = useState<{
    title?: string;
    username?: string;
    password?: string;
  }>({});
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addNewPassword, updateExistingPassword, deletePassword, decryptPassword } = usePasswords();
  
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setUsername(initialData.username);
      // Decrypt the password if in edit mode
      if (isEditing) {
        setPassword(decryptPassword(initialData.password));
      } else {
        setPassword(initialData.password);
      }
      setWebsite(initialData.website || '');
      setNotes(initialData.notes || '');
      setCategory(initialData.category || 'Personal');
    }
  }, [initialData, isEditing, decryptPassword]);
  
  const validate = (): boolean => {
    const newErrors: {
      title?: string;
      username?: string;
      password?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isEditing) {
      // Only check password strength for new passwords
      const strength = checkPasswordStrength(password);
      if (strength.score < 2) {
        newErrors.password = 'Consider using a stronger password';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleGeneratePassword = () => {
    setIsGeneratingPassword(true);
    setTimeout(() => {
      const newPassword = generatePassword(16, true, true, true, true);
      setPassword(newPassword);
      setIsGeneratingPassword(false);
    }, 500); // Simulate password generation
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (isEditing && initialData?.id) {
        await updateExistingPassword({
          ...initialData,
          title,
          username,
          password,
          website,
          notes,
          category,
          updatedAt: new Date()
        });
      } else {
        await addNewPassword({
          title,
          username,
          password,
          website,
          notes,
          category,
          favorite: false
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving password:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    if (window.confirm('Are you sure you want to delete this password?')) {
      setIsLoading(true);
      try {
        await deletePassword(initialData.id);
        onClose();
      } catch (error) {
        console.error('Error deleting password:', error);
      } finally {
        setIsLoading(false);
      }
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
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full mx-auto">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Edit Password' : 'Add New Password'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <Input 
            label="Title"
            placeholder="e.g., Gmail, Facebook, Bank Account"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            fullWidth
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input 
              label="Username / Email"
              placeholder="Enter username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              fullWidth
              leftIcon={<User size={18} />}
            />
          </div>
          
          <div>
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <Input 
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  fullWidth
                  leftIcon={<Lock size={18} />}
                  showPasswordToggle
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={<RefreshCw size={16} className={isGeneratingPassword ? 'animate-spin' : ''} />}
                onClick={handleGeneratePassword}
                className="mb-1"
              >
                Generate
              </Button>
            </div>
            {renderPasswordStrength()}
          </div>
        </div>
        
        <div>
          <Input 
            label="Website (optional)"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            fullWidth
            leftIcon={<Globe size={18} />}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Tag size={18} />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 text-gray-500">
              <FileText size={18} />
            </div>
            <textarea
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-sm h-24 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          {isEditing && initialData?.id && (
            <Button
              type="button"
              variant="danger"
              icon={<Trash size={18} />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            icon={isEditing ? <Save size={18} /> : <Plus size={18} />}
          >
            {isEditing ? 'Save Changes' : 'Add Password'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PasswordForm;