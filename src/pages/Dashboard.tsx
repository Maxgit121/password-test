import React, { useState, useEffect } from 'react';
import { PlusCircle, ShieldAlert } from 'lucide-react';
import { Password } from '../types';
import { usePasswords } from '../context/PasswordContext';
import PasswordList from '../components/passwords/PasswordList';
import PasswordForm from '../components/passwords/PasswordForm';
import PasswordSearch from '../components/passwords/PasswordSearch';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([]);
  
  const { passwords, loading, error, searchPasswords, filterPasswordsByCategory } = usePasswords();
  
  // Filter passwords based on search query and selected category
  useEffect(() => {
    let result = passwords;
    
    if (searchQuery) {
      result = searchPasswords(searchQuery);
    }
    
    if (selectedCategory !== 'all') {
      result = filterPasswordsByCategory(selectedCategory);
    }
    
    setFilteredPasswords(result);
  }, [passwords, searchQuery, selectedCategory, searchPasswords, filterPasswordsByCategory]);
  
  const handleAddPassword = () => {
    setSelectedPassword(undefined);
    setShowEditForm(false);
    setShowAddForm(true);
  };
  
  const handleEditPassword = (password: Password) => {
    setSelectedPassword(password);
    setShowAddForm(false);
    setShowEditForm(true);
  };
  
  const handleCloseForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
  };
  
  const getUniqueCategories = (): string[] => {
    const categories = passwords
      .map(p => p.category)
      .filter((category): category is string => !!category);
    return [...new Set(categories)];
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading passwords</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
      {/* Modal for Add/Edit Password */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <PasswordForm
              initialData={showEditForm ? selectedPassword : undefined}
              onClose={handleCloseForm}
              isEditing={showEditForm}
            />
          </div>
        </div>
      )}
      
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Passwords</h1>
        <Button
          variant="primary"
          icon={<PlusCircle size={20} />}
          onClick={handleAddPassword}
        >
          Add Password
        </Button>
      </div>
      
      <PasswordSearch
        onSearch={setSearchQuery}
        onFilter={setSelectedCategory}
        categories={getUniqueCategories()}
      />
      
      <div className="mt-4">
        <PasswordList 
          data={filteredPasswords}
          onEdit={handleEditPassword}
        />
      </div>
    </div>
  );
};

export default Dashboard;